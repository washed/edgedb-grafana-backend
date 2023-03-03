import React, { PureComponent, SyntheticEvent } from 'react';
import { FieldSet, InlineField, Input, Select, SecretInput } from '@grafana/ui';
import {
  DataSourcePluginOptionsEditorProps,
  SelectableValue,
  updateDatasourcePluginJsonDataOption,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceSecureJsonDataOption,
  updateDatasourcePluginResetOption,
} from '@grafana/data';
import { EdgeDBDataSourceOptions, EdgeDBTLSModes } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<EdgeDBDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onResetPassword = () => {
    updateDatasourcePluginResetOption(this.props, 'password');
  };

  onDSOptionChanged = (property: keyof EdgeDBDataSourceOptions) => {
    console.log('ds changed');
    const { onOptionsChange, options } = this.props;
    return (event: SyntheticEvent<HTMLInputElement>) => {
      onOptionsChange({ ...options, ...{ [property]: event.currentTarget.value } });
    };
  };

  onJSONDataOptionSelected = (property: keyof EdgeDBDataSourceOptions) => {
    return (value: SelectableValue) => {
      updateDatasourcePluginJsonDataOption(this.props, property, value.value);
    };
  };

  tlsModes: Array<SelectableValue<EdgeDBTLSModes>> = [
    { value: EdgeDBTLSModes.strict, label: 'strict' },
    { value: EdgeDBTLSModes.no_host_verification, label: 'no_host_verification' },
    { value: EdgeDBTLSModes.insecure, label: 'insecure' },
  ];

  render() {
    const { options } = this.props;
    const { secureJsonFields } = options;
    const jsonData = (options.jsonData || {}) as EdgeDBDataSourceOptions;

    const labelWidthConnection = 20;

    return (
      <>
        <FieldSet label="EdgeDB Connection" width={400}>
          <InlineField labelWidth={labelWidthConnection} label="Host">
            <Input
              width={40}
              name="host"
              type="text"
              value={jsonData.host || ''}
              placeholder="localhost"
              onChange={onUpdateDatasourceJsonDataOption(this.props, 'host')}
            ></Input>
          </InlineField>
          <InlineField labelWidth={labelWidthConnection} label="Port">
            <Input
              width={40}
              name="port"
              type="text"
              value={jsonData.port || ''}
              placeholder="5656"
              onChange={onUpdateDatasourceJsonDataOption(this.props, 'port')}
            ></Input>
          </InlineField>
          <InlineField labelWidth={labelWidthConnection} label="User">
            <Input
              width={40}
              name="user"
              type="text"
              value={jsonData.user || ''}
              placeholder="edgedb"
              onChange={onUpdateDatasourceJsonDataOption(this.props, 'user')}
            ></Input>
          </InlineField>
          <InlineField labelWidth={labelWidthConnection} label="Password">
            <SecretInput
              width={40}
              isConfigured={secureJsonFields?.password}
              onReset={this.onResetPassword}
              onBlur={onUpdateDatasourceSecureJsonDataOption(this.props, 'password')}
            ></SecretInput>
          </InlineField>
          <InlineField labelWidth={labelWidthConnection} label="Database">
            <Input
              width={40}
              name="database"
              type="text"
              value={jsonData.database || ''}
              placeholder="edgedb"
              onChange={onUpdateDatasourceJsonDataOption(this.props, 'database')}
            ></Input>
          </InlineField>
          <InlineField labelWidth={labelWidthConnection} label="TLS Security">
            <Select
              options={this.tlsModes}
              inputId="tlsMode"
              value={jsonData.tlsMode || EdgeDBTLSModes.strict}
              onChange={this.onJSONDataOptionSelected('tlsMode')}
            ></Select>
          </InlineField>
        </FieldSet>
      </>
    );
  }
}
