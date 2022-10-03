import { DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv, TemplateSrv } from '@grafana/runtime';
import EdgeDBQueryModel from 'edgedb_query_model';
import { EdgeDBVariableSupport } from 'variables';
import { EdgeDBDataSourceOptions, EdgeDBQuery } from './types';
import { map as _map } from 'lodash';

export class EdgeDBDatasource extends DataSourceWithBackend<EdgeDBQuery, EdgeDBDataSourceOptions> {
  queryModel: EdgeDBQueryModel;

  constructor(
    instanceSettings: DataSourceInstanceSettings<EdgeDBDataSourceOptions>,
    private readonly templateSrv: TemplateSrv = getTemplateSrv()
  ) {
    super(instanceSettings);

    this.variables = new EdgeDBVariableSupport();
    this.queryModel = new EdgeDBQueryModel({});
  }

  interpolateVariable = (value: string | string[], variable: { multi: any; includeAll: any }) => {
    if (typeof value === 'string') {
      if (variable.multi || variable.includeAll) {
        return this.queryModel.quoteLiteral(value);
      } else {
        return value;
      }
    }

    if (typeof value === 'number') {
      return value;
    }

    const quotedValues = _map(value, (v) => {
      return this.queryModel.quoteLiteral(v);
    });
    return quotedValues.join(',');
  };

  applyTemplateVariables(target: EdgeDBQuery, scopedVars: ScopedVars): Record<string, any> {
    const queryModel = new EdgeDBQueryModel(target, this.templateSrv, scopedVars);

    return {
      refId: target.refId,
      queryText: queryModel.render(this.interpolateVariable),
    };
  }
}
