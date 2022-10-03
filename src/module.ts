import { DataSourcePlugin } from '@grafana/data';
import { EdgeDBDatasource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { EdgeDBQuery, EdgeDBDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<EdgeDBDatasource, EdgeDBQuery, EdgeDBDataSourceOptions>(EdgeDBDatasource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
