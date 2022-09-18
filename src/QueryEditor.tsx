import { defaults } from 'lodash';

import React, { PureComponent } from 'react';
import { TextArea } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, EdgeDBDataSourceOptions, EdgeDBQuery } from './types';

type Props = QueryEditorProps<DataSource, EdgeDBQuery, EdgeDBDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  /*
  onQueryTextChange = (event) => {
    const { onChange, query, onRunQuery } = this.props;
    console.log(`Event: ${event}`);
    onChange({ ...query, queryText: event.target.value});
    onRunQuery();
  };
  */

  onQueryTextChange: React.FormEventHandler<HTMLTextAreaElement> = (event) => {
    const { onChange, query, onRunQuery } = this.props;
    console.log(`Event: ${event}`);
    onChange({ ...query, queryText: event.currentTarget.value});
    onRunQuery();
  }

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText } = query;

    return (
      <div className="gf-form">
        <TextArea
          onChange={this.onQueryTextChange}
          width={32}
          value={queryText || ''}
          label="Query Text 2"
          type="string"
          readOnly={false}
          contentEditable={true}
        />
      </div>
    );
  }

}
