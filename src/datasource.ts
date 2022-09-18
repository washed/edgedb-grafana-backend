import { DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { EdgeDBDataSourceOptions, EdgeDBQuery } from './types';

export class DataSource extends DataSourceWithBackend<EdgeDBQuery, EdgeDBDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<EdgeDBDataSourceOptions>) {
    super(instanceSettings);
  }
}
