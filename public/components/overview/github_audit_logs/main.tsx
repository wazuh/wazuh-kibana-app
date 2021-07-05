/*
 * Wazuh app - Mitre alerts components
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react'
import { FilterManager } from '../../../../../../src/plugins/data/public';

//@ts-ignore
import { getIndexPattern, IFilterParams } from '../mitre/lib';
import { getDataPlugin } from '../../../kibana-services';
import  { ModuleGitHubAuditLogs } from './audit-logs';
import { getGitHubAlerts } from './resources/get-github-alerts'

export class GitGubInventorySection extends Component {
  timefilter: {
    getTime(): any
    setTime(time: any): void
    _history: { history: { items: { from: string, to: string }[] } }
  };

  KibanaServices: { [key: string]: any };
  filterManager: FilterManager;
  indexPattern: any;
  state: {
    gitHubAlerts: any
    filterParams: IFilterParams,
  }

  props: any;

  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin().query;
    this.filterManager = this.KibanaServices.filterManager;
    this.timefilter = this.KibanaServices.timefilter.timefilter;
    this.state = {
      filterParams: {
        filters: this.filterManager.getFilters() || [],
        query: { language: 'kuery', query: 'github' },
        time: this.timefilter.getTime(),
      },
    }
  }

  async componentDidMount() {
    this.getValues()
  }

  async getValues() {
    const aggs = {}
    this.indexPattern = await getIndexPattern();
    const data = await getGitHubAlerts(this.indexPattern, this.state.filterParams, aggs)
    console.log(data)
  }


  render() {
    return (
    <div>
      <ModuleGitHubAuditLogs/>
    </div>
    )
  }
}

