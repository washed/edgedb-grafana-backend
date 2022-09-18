import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { EdgeDBDataSourceOptions, EdgeDBSecureJsonData } from './types';

const { SecretFormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<EdgeDBDataSourceOptions> { }

interface State { }

export class ConfigEditor extends PureComponent<Props, State> {
  onDSNChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        DSN: event.target.value,
      },
    });
  };

  onResetDSN = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        DSN: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        DSN: '',
      },
    });
  };

  render() {
    const { options } = this.props;
    const { secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as EdgeDBSecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.DSN) as boolean}
              value={secureJsonData.DSN || ''}
              label="DSN"
              placeholder="edgedb://USERNAME:PASSWORD@HOSTNAME:PORT/DATABASE"
              labelWidth={6}
              inputWidth={20}
              onReset={this.onResetDSN}
              onChange={this.onDSNChange}
            />
          </div>
        </div>
      </div>
    );
  }
}
