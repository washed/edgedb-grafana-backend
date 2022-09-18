import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface EdgeDBQuery extends DataQuery {
  queryText?: string;
}

export const defaultQuery: Partial<EdgeDBQuery> = {
  queryText: 'SELECT { time := <int64>$from, value := 0 } FILTER <int64>$from <= .time AND .time <= <int64>$to;',
};


// TODO: put non-secure options in here
export interface EdgeDBDataSourceOptions extends DataSourceJsonData {}

export interface EdgeDBSecureJsonData {
  DSN?: string;
}
