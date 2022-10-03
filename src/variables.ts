import { StandardVariableQuery, StandardVariableSupport } from '@grafana/data';

import { EdgeDBDatasource } from './datasource';
import { EdgeDBQuery } from './types';

export class EdgeDBVariableSupport extends StandardVariableSupport<EdgeDBDatasource> {
  toDataQuery(query: StandardVariableQuery): EdgeDBQuery {
    return {
      refId: 'EdgeDBDatasource-VariableQuery',
      queryText: query.query,
    };
  }
}
