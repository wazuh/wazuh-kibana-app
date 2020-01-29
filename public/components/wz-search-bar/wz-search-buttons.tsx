/*
 * Wazuh app - React component for show search and filter
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component } from 'react';
import { EuiButtonGroup } from '@elastic/eui';
import index from "../../../test/functional/apps/overview";

export interface filterButton {
  label: string
  field: string
  value: string | number
  iconType?: string
}

export class WzSearchButtons extends Component {
  props!: {
    options: filterButton[]
    filters: {}
    onChange: Function
  };
  state: {
    toggleIconIdToSelectedMap: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      toggleIconIdToSelectedMap: {},
    };
    this.onChange.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const currenttFilters = JSON.stringify(this.props.filters);
    const nextFilters = JSON.stringify(nextProps.filters);
    return (currenttFilters !== nextFilters ? false : true);
  }

  componentDidUpdate() {
    this.checkFilters();
  }

  buildOptions() {
    const { options } = this.props;
    const buttonGroupOption = options.map((item, index) => {
      return {
        id: item.label,
        label: item.label,
        name: "gola",
        ...(item.iconType && {iconType:item.iconType}),
      }
    });
    return buttonGroupOption;
  }

  onChange(optionId) {
    const { toggleIconIdToSelectedMap } = this.state;
    const newToggleIconIdToSelectedMap = {
      ...toggleIconIdToSelectedMap,
      ...{
        [optionId]: !toggleIconIdToSelectedMap[optionId],
      },
    };

    const result = this.changeFilters(optionId, !toggleIconIdToSelectedMap[optionId]);
    this.props.onChange(result);
    this.setState({
      toggleIconIdToSelectedMap: newToggleIconIdToSelectedMap,
    });
  }

  changeFilters(optionId, status) {
    const { options, filters } = this.props;
    const button = options.find(item => item.label === optionId) || {};

    if(status) {
      return {
        ...filters,
        [button['field']]: button['value']
      }
    } else {
      return delete filters[button['field']]
    }
  }

  selectFilter(optionLabel, newStatus) {
    const { toggleIconIdToSelectedMap } = this.state;
    const newToggleIconIdToSelectedMap = {
      ...toggleIconIdToSelectedMap,
      ...{
        [optionLabel]: newStatus,
      },
    };
    this.setState({
      toggleIconIdToSelectedMap: newToggleIconIdToSelectedMap
    });
  }

  checkFilters() {
    const { filters, options } = this.props;
    const { toggleIconIdToSelectedMap } = this.state;

    if (Object.keys(toggleIconIdToSelectedMap).length === 0 && toggleIconIdToSelectedMap.constructor === Object) {
      // OBJETO BOTONES VACIO
      for (const filter of Object.keys(filters)) {
        for (const option of options) {
          if (filter === option.field) {
            this.selectFilter(option.label,true);
          }
        }
      }
    }
  }

  render() {
    const { toggleIconIdToSelectedMap } = this.state;
    const options = this.buildOptions();
    return (
      <EuiButtonGroup
        legend="Text align"
        name="textAlign"
        buttonSize="m"
        options={options}
        idToSelectedMap={toggleIconIdToSelectedMap}
        type="multi"
        onChange={this.onChange.bind(this)}
      />
    )
  }
}
