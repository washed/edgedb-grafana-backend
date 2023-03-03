import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface EdgeDBQuery extends DataQuery {
  queryText?: string;
}

export const defaultQuery: Partial<EdgeDBQuery> = {
  queryText:
    'SELECT SomeTimeSeries { time := .timestamp, value } filter .time >= to_datetime($__from / 1000) and .time <= to_datetime($__to / 1000);',
};

export enum EdgeDBTLSModes {
  strict = 'strict',
  no_host_verification = 'no_host_verification',
  insecure = 'insecure',
}

export interface EdgeDBDataSourceOptions extends DataSourceJsonData {
  host: string;
  port: string;
  user: string;
  database: string;
  tlsMode: EdgeDBTLSModes;
}

export interface EdgeDBSecureJsonData {
  password?: string;
}
