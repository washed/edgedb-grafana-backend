import { map } from 'lodash';

import { ScopedVars } from '@grafana/data';
import { TemplateSrv } from '@grafana/runtime';
import { EdgeDBQuery } from 'types';

// mostly copy paste from the postgres datasource

export default class EdgeDBQueryModel {
  target: EdgeDBQuery;
  templateSrv?: TemplateSrv;
  scopedVars?: ScopedVars;

  /** @ngInject */
  constructor(target: any, templateSrv?: TemplateSrv, scopedVars?: ScopedVars) {
    this.target = target;
    this.templateSrv = templateSrv;
    this.scopedVars = scopedVars;

    // give interpolateQueryStr access to this
    this.interpolateQueryStr = this.interpolateQueryStr.bind(this);
  }

  quoteLiteral(value: any) {
    return "'" + String(value).replace(/'/g, "''") + "'";
  }

  escapeLiteral(value: any) {
    return String(value).replace(/'/g, "''");
  }

  interpolateQueryStr(value: any, variable: { multi: any; includeAll: any }, defaultFormatFn: any) {
    // if no multi or include all do not regexEscape
    if (!variable.multi && !variable.includeAll) {
      return this.escapeLiteral(value);
    }

    if (typeof value === 'string') {
      return this.quoteLiteral(value);
    }

    const escapedValues = map(value, this.quoteLiteral);
    return escapedValues.join(',');
  }

  render(interpolate?: any) {
    const target = this.target;

    if (interpolate && typeof this.templateSrv !== 'undefined') {
      return this.templateSrv?.replace(target.queryText, this.scopedVars, this.interpolateQueryStr);
    } else {
      return target.queryText;
    }
  }
}
