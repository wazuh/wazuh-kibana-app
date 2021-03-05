/*
 * Wazuh app - React component for Logtest.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { DynamicHeight } from '../../../utils/dynamic-height';
import {
  EuiBadge,
  EuiButton,
  EuiCodeBlock,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPanel,
  EuiSelect,
  EuiSpacer,
  EuiTextArea,
  EuiTitle,
} from '@elastic/eui';
import { WzRequest } from '../../../react-services';
import { TimeService } from '../../../react-services/time-service';

export const Logtest = (props) => {
  const [value, setValue] = useState(
    ''
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(false);
  const [logTypeSelect, setLogTypeSelect] = useState('log');
  const [logLocation, setlogLocation] = useState('logtest');

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const formatResult = (result) => {
    debugger;
    return (
      `**Phase 1: Completed pre-decoding. \n    ` +
      `full event:  ${result.full_log}  \n    ` +
      `timestamp: ${(result.predecoder || '').timestamp || '-'} \n    ` +
      `hostname: ${(result.predecoder || '').hostname || '-'} \n    ` +
      `program_name: ${(result.predecoder || '').program_name || '-'} \n\n` +
      `**Phase 2: Completed decoding. \n    ` +
      `name: ${(result.decoder || '').name || '-'} \n   ` +
      `parent: ${(result.decoder || '').parent || '-'} \n    ` +
      `srcip: ${(result.data || '').srcip || '-'}  \n    ` +
      `srcport: ${(result.data || '').srcport || '-'} \n    ` +
      `srcuser: ${(result.data || '').srcuser || '-'} \n\n` +
      `**Phase 3: Completed filtering (rules). \n    ` +
      `id: ${(result.rule || '').id || '-'} \n    ` +
      `level: ${(result.rule || '').level || '-'} \n    ` +
      `description: ${(result.rule || '').description || '-'} \n    ` +
      `groups: ${JSON.stringify((result.rule || '').groups || '-')} \n    ` +
      `firedtimes: ${(result.rule || '').firedtimes || '-'} \n    ` +
      `gdpr: ${JSON.stringify((result.rule || '').gdpr || '-')} \n    ` +
      `gpg13: ${JSON.stringify((result.rule || '').gpg13 || '-')} \n    ` +
      `hipaa: ${JSON.stringify((result.rule || '').hipaa || '-')} \n    ` +
      `mail: ${result.rule || ''.mail || '-'} \n    ` +
      `mitre.id: ${JSON.stringify((result.rule || '').mitre || ''.id || '-')} \n    ` +
      `mitre.technique: ${JSON.stringify(
        (result.rule || '').mitre || ''.technique || '-'
      )} \n    ` +
      `nist_800_53: ${JSON.stringify((result.rule || '').nist_800_53 || '-')} \n    ` +
      `pci_dss: ${JSON.stringify((result.rule || '').pci_dss || '-')} \n    ` +
      `tsc: ${JSON.stringify((result.rule || '').tsc || '-')} \n` +
      `**Alert to be generated.`
    );
  };

  const test = async () => {
    setTesting(true);
    const body = {
      log_format: 'syslog',
      location: 'logtest',
      event: value,
    };

    const result = await WzRequest.apiReq('PUT', '/logtest', body);

    setTesting(false);
    setTestResult(formatResult(result.data.data.output));
    // setTestResult(JSON.stringify(result.data.data.output, null, '\t')); // plan b ?
  };

  const buildControls = () => {
    const logsTypeOptions = [{ value: 'log', text: 'Log' }];

    const onChangeLogTypeSelect = () => {
      return (e) => setLogTypeSelect(e.target.value);
    };
    const onChangeLogLocation = () => {
      return (e) => setlogLocation(e.target.value);
    };

    return (
      <Fragment>
        <EuiFlexItem grow={false}>
          <EuiSelect
            id="logsTypeOptions"
            options={logsTypeOptions}
            value={logTypeSelect}
            onChange={onChangeLogTypeSelect}
            aria-label="Logs type"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFieldText
            placeholder="Log location"
            value={logLocation}
            onChange={onChangeLogLocation}
            aria-label="Log location"
          />
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiButton
            isLoading={testing}
            isDisabled={testing || !value}
            iconType="play"
            fill
            onClick={() => {
              test();
            }}
          >
            Test
          </EuiButton>
        </EuiFlexItem>
      </Fragment>
    );
  };

  const buildLogtest = () => {
    return (
      <Fragment>
        <EuiTextArea
          placeholder="Type one log per line..."
          fullWidth={true}
          aria-label=""
          rows={props.showClose ? 10 : 4}
          onChange={onChange}
        />
        <EuiSpacer size="m" />
        <EuiCodeBlock
          language="json"
          fontSize="s"
          style={
            (!props.onFlyout && { height: 'calc(100vh - 400px)' }) || {
              height: 'calc(100vh - 355px)',
            }
          }
          isCopyable={!!testResult}
        >
          {testResult || 'The test result will appear here.'}
        </EuiCodeBlock>
      </Fragment>
    );
  };

  const dynamicHeight = () =>
    DynamicHeight.dynamicHeightStatic('.euiCodeBlock', props.showClose ? 70 : 100);

  dynamicHeight();
  return (
    <Fragment>
      {(!props.onFlyout && (
        <EuiPage>
          <EuiPanel paddingSize="l">
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFlexGroup gutterSize="m">
                  <Fragment>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="m">
                        <h2>Test your logs</h2>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ padding: '10px 0' }}>
                      <EuiBadge color="#BD271E" iconType="clock">
                        Test session started at {TimeService.offset(new Date())}
                      </EuiBadge>
                    </EuiFlexItem>
                  </Fragment>
                  <EuiFlexItem />
                  {buildControls()}
                </EuiFlexGroup>
                <EuiSpacer size="s" />
                {buildLogtest()}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiPage>
      )) || (
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem />
              {buildControls}
            </EuiFlexGroup>
            <EuiSpacer size="s" />
            {buildLogtest}
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </Fragment>
  );
};

Logtest.propTypes = {
  close: PropTypes.func,
  showClose: PropTypes.bool,
  onFlyout: PropTypes.bool,
};
