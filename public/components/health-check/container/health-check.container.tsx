/*
 * Wazuh app - Health Check Component
 *
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 *
 */

import {
  EuiButton,
  EuiCallOut,
  EuiDescriptionList,
  EuiSpacer,
} from '@elastic/eui';
import React, { Fragment, useState, useEffect } from 'react';
import { AppState, ErrorHandler } from '../../../react-services';
import { useAppConfig } from '../../../components/common/hooks';
import {
  checkPatternService,
  checkTemplateService,
  checkApiService,
  checkSetupService,
  checkFieldsService,
  checkKibanaSettings,
  checkKibanaSettingsTimeFilter,
  checkPatternSupportService
} from '../services';
import { CheckResult } from '../components/check-result';
import { withReduxProvider } from '../../common/hocs';
import { getHttp } from '../../../kibana-services';
import { WAZUH_INDEX_TYPE_MONITORING, WAZUH_INDEX_TYPE_STATISTICS } from '../../../../common/constants';

const checks = {
  api: {    
    title: 'Check Wazuh API connection',
    validator: checkApiService,
    awaitFor: [],
    canRetry: true,
  },
  setup: {
    title: 'Check for Wazuh API version',
    validator: checkSetupService,
    awaitFor: ["api"],
  },
  pattern: {
    title: 'Check Elasticsearch index pattern',
    validator: checkPatternService,
    awaitFor: [],
    canRetry: true,
  },
  template: {
    title: 'Check Elasticsearch template',
    validator: checkTemplateService,
    awaitFor: ["pattern"],
    canRetry: true,
  },
  fields: {
    title: 'Check index pattern fields',
    validator: checkFieldsService,
    awaitFor: ["pattern"],
    canRetry: true,
  },
  patternMonitoring: {
    title: 'Check Monitoring index pattern',
    validator: (appConfig) => checkPatternSupportService(appConfig.data['wazuh.monitoring.pattern'], WAZUH_INDEX_TYPE_MONITORING),
    awaitFor: [],
    shouldCheck: true,
    canRetry: true,
  },
  patternStatistics: {
    title: 'Check Statistics index pattern',
    validator: (appConfig) => checkPatternSupportService(`${appConfig.data['cron.prefix']}-${appConfig.data['cron.statistics.index.name']}-*`, WAZUH_INDEX_TYPE_STATISTICS),
    awaitFor: [],
    shouldCheck: true,
    canRetry: true,
  }
};

export const HealthCheck = withReduxProvider(function HealthCheck() {
  const [checkErrors, setCheckErrors] = useState<{[key:string]: []}>({});
  const [checksReady, setChecksReady] = useState<{[key: string]: boolean}>({});
  const appConfig = useAppConfig();

  useEffect(() => {
    if (appConfig.isReady) {
      checkKibanaSettings(appConfig.data['checks.metaFields']);
      checkKibanaSettingsTimeFilter(appConfig.data['checks.timeFilter']);
      AppState.setPatternSelector(appConfig.data['ip.selector']);
    }
  }, [appConfig]);

  useEffect(() => {
    // Redirect to app
    Object.keys(checks)
      .every(check => checksReady[check]) && (window.location.href = getHttp().basePath.prepend('/app/wazuh#/overview'));
  }, [checksReady, appConfig])

  const handleErrors = (checkID, errors, parsed) => {
    const newErrors = parsed
      ? errors.map((error) =>
          ErrorHandler.handle(error, 'Health Check', { warning: false, silent: true })
        )
      : errors;
    setCheckErrors((prev) => ({...prev, [checkID]: newErrors}));
  };

  const cleanErrors = (checkID: string) => {
    delete checkErrors[checkID];
    setCheckErrors({...checkErrors});
  }

  const handleCheckReady = (checkID, isReady) => {    
    setChecksReady(prev =>  ({...prev, [checkID]: isReady}));
  }

  const renderChecks = () => {
    return Object.keys(checks).map((check, index) => {
      return (
        <CheckResult
          key={index}          
          name={check}
          title={checks[check].title}
          awaitFor={checks[check].awaitFor}
          check={checks[check].shouldCheck || appConfig.data[`checks.${check}`]}
          validationService={() => checks[check].validator(appConfig)}
          handleErrors={handleErrors}
          cleanErrors={cleanErrors}
          isLoading={appConfig.isLoading}
          handleCheckReady= {handleCheckReady}
          checksReady={checksReady}
          canRetry={checks[check].canRetry}
        />
      );
    });
  };

  const renderErrors = () => {
    return Object.keys(checkErrors).map((checkID) => 
      checkErrors[checkID].map((error, index) => (
        <Fragment key={index}>
          <EuiCallOut
            title={error}
            color="danger"
            iconType="alert"
            style={{ textAlign: 'left' }}
            data-test-subj='callOutError'
          ></EuiCallOut>
          <EuiSpacer size="xs" />
        </Fragment>
      ))
    ) 
  };

  const logo_url = getHttp().basePath.prepend('/plugins/wazuh/assets/icon_blue.svg');
  return (
    <div className="health-check">
      <img src={logo_url} className="health-check-logo" alt=""></img>
      <div className="margin-top-30">
        <EuiDescriptionList textStyle="reverse" align="center" type="column">
          {renderChecks()}
        </EuiDescriptionList>
      </div>
      <EuiSpacer size="xxl" />
      {renderErrors()}
      <EuiSpacer size="xxl" />
      {Object.keys(checkErrors).length > 0 ? (
        <EuiButton fill href={getHttp().basePath.prepend('/app/wazuh#/settings')}>
          Go to App
        </EuiButton>
      ): null}
    </div>
  );
})
