package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"sort"
	"strings"

	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"

	"github.com/edgedb/edgedb-go"
)

// Make sure EdgeDBDatasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler, backend.StreamHandler interfaces. Plugin should not
// implement all these interfaces - only those which are required for a particular task.
// For example if plugin does not need streaming functionality then you are free to remove
// methods that implement backend.StreamHandler. Implementing instancemgmt.InstanceDisposer
// is useful to clean up resources used by previous datasource instance when a new datasource
// instance created upon datasource settings changed.
var (
	_ backend.QueryDataHandler      = (*EdgeDBDatasource)(nil)
	_ backend.CheckHealthHandler    = (*EdgeDBDatasource)(nil)
	_ instancemgmt.InstanceDisposer = (*EdgeDBDatasource)(nil)
)

// NewEdgeDBDatasource creates a new datasource instance.
func NewEdgeDBDatasource(
	dataSourceInstanceSettings backend.DataSourceInstanceSettings,
) (instancemgmt.Instance, error) {
	opts := edgedb.Options{}
	dsn := dataSourceInstanceSettings.DecryptedSecureJSONData["DSN"]

	client, err := edgedb.CreateClientDSN(nil, dsn, opts)
	if err != nil {
		log.DefaultLogger.Error("Error connecting to database!", "err", err.Error())
		return nil, err
	}

	d := &EdgeDBDatasource{client: client}
	log.DefaultLogger.Info("Connected to database")
	return d, nil
}

// EdgeDBDatasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type EdgeDBDatasource struct {
	client *edgedb.Client
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewEdgeDBDatasource factory function.
func (d *EdgeDBDatasource) Dispose() {
	// Clean up datasource instance resources.
	err := d.client.Close()
	if err != nil {
		log.DefaultLogger.Error("Error closing database connection", "err", err.Error())
	} else {
		log.DefaultLogger.Info("Database connection closed")
	}
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *EdgeDBDatasource) QueryData(
	ctx context.Context,
	req *backend.QueryDataRequest,
) (*backend.QueryDataResponse, error) {
	log.DefaultLogger.Info("QueryData called", "request", req)

	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

type queryModel struct {
	DatasourceId  int    `json:"datasourceId"`
	IntervalMs    int    `json:"intervalMs"`
	MaxDataPoints int    `json:"maxDataPoints"`
	QueryText     string `json:"queryText"`
	RefId         string `json:"refId"`
}

func (d *EdgeDBDatasource) query(
	ctx context.Context,
	pCtx backend.PluginContext,
	query backend.DataQuery,
) backend.DataResponse {
	response := backend.DataResponse{}

	var qm queryModel
	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}

	// cleanup trailing whitespace from query lines
	query_lines := strings.Split(qm.QueryText, "\n")
	for i, query_line := range query_lines {
		query_lines[i] = strings.TrimSpace(query_line)
	}
	cleanedQuery := strings.Join(query_lines[:], "\n")

	log.DefaultLogger.Debug("cleanedQuery", "cleanedQuery", cleanedQuery)

	var result []byte
	err := d.client.QueryJSON(ctx, cleanedQuery, &result)
	if err != nil {
		log.DefaultLogger.Error("Error when querying database", "err", err.Error())
		response.Error = err
		return response
	}

	log.DefaultLogger.Debug("Query returned with results!", "cleanedQuery", cleanedQuery)

	var queryResult []map[string]interface{}

	if err := json.Unmarshal(result, &queryResult); err != nil {
		log.DefaultLogger.Error("Error unmarshalling database response", "err", err.Error())
		response.Error = err
		return response
	}

	// create data frame response.
	frame := data.NewFrame("response")

	if len(queryResult) == 0 {
		// TODO: check if this is a correct empty response
		return response
	}

	// add fields.
	first_item := queryResult[0]

	// we want a stable iteration order, so we create
	// a sorted slice of the keys here
	keys := make([]string, 0, len(first_item))
	for key := range first_item {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	for _, key := range keys {
		element := first_item[key]
		fieldType := reflect.TypeOf(element)
		log.DefaultLogger.Debug("Adding field: ", key, "of type: ", fieldType)

		if key == "time" {
			column := make([]time.Time, len(queryResult))
			for i, v := range queryResult {
				t, err := time.Parse(time.RFC3339, v[key].(string))
				if err != nil {
					log.DefaultLogger.Error(err.Error())
					response.Error = err
					return response
				}
				column[i] = t
			}
			frame.Fields = append(frame.Fields,
				data.NewField(key, nil, column),
			)
		} else {
			switch element.(type) {
			case float64:
				column := make([]float64, len(queryResult))
				for i, v := range queryResult {
					column[i] = v[key].(float64)
				}
				frame.Fields = append(frame.Fields,
					data.NewField(key, nil, column),
				)
			case string:
				column := make([]string, len(queryResult))
				for i, v := range queryResult {
					column[i] = v[key].(string)
				}
				frame.Fields = append(frame.Fields,
					data.NewField(key, nil, column),
				)
			}
		}
	}

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}

func (d *EdgeDBDatasource) QueryHealthCheck(pCtx backend.PluginContext) (int64, bool, error) {
	ctx := context.Background()

	var result int64

	err := d.client.QuerySingle(ctx, "select 2+2", &result)
	if err != nil {
		log.DefaultLogger.Error(err.Error())
		return result, false, err
	}
	log.DefaultLogger.Info("Queried 'select 2+2', result: ", result)

	return result, result == 4, nil
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *EdgeDBDatasource) CheckHealth(
	_ context.Context,
	req *backend.CheckHealthRequest,
) (*backend.CheckHealthResult, error) {
	log.DefaultLogger.Info("CheckHealth called", "request", req)

	value, result, err := d.QueryHealthCheck(req.PluginContext)

	var status backend.HealthStatus
	var message string

	if result {
		status = backend.HealthStatusOk
		message = fmt.Sprintf("Data source is working: `select 2+2;` == `%v`", value)
	} else {
		status = backend.HealthStatusError
		message = fmt.Sprintf("Data source is in error: `%s`", err)
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}
