import { DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { EdgeDBVariableSupport } from 'variables';
import { EdgeDBDataSourceOptions, EdgeDBQuery } from './types';

export class EdgeDBDatasource extends DataSourceWithBackend<EdgeDBQuery, EdgeDBDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<EdgeDBDataSourceOptions>) {
    super(instanceSettings);

    this.variables = new EdgeDBVariableSupport();
  }
}
