/*
 * Wazuh app - React component for show search and filter
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component, KeyboardEvent } from 'react';
import PropTypes, {InferProps} from 'prop-types';
import { EuiSuggest } from '../eui-suggest';
import { WzSearchFormatSelector } from './wz-search-format-selector';
import { WzSearchBadges } from './wz-search-badges';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { QHandler, qSuggests } from './lib/q-handler';
import { ApiHandler, apiSuggests } from './lib/api-handler';

export interface suggestItem {
  type: {iconType: string, color: string }
  label: string
  description?: string
}

export default class WzSearchBar extends Component {
  state: {
    searchFormat: string
    suggestions: suggestItem[]
    isProcessing: boolean
    inputValue: string
    lastField?: string
    lastOperator?: string
    isInvalid: boolean
    status: string
    filters: {}
    isPopoverOpen: boolean
  };
  suggestHandler!: QHandler | ApiHandler;
  props!:{
    qSuggests: qSuggests[]
    apiSuggests: apiSuggests[]
    onInputChange: Function
    searchDisable?: boolean
    defaultFormat?: string
    placeholder?: string
  };

  constructor(props) {
    super(props);
    const searchFormat = this.selectSearchFormat(props);
    this.state = {
      searchFormat,
      suggestions: [],
      isProcessing: true,
      inputValue: '',
      isInvalid: false,
      status: 'unchanged',
      filters: {},
      isPopoverOpen: false,
    }
  }

  selectSearchFormat(props) {
    const searchFormat = (props.defaultFormat)
    ? props.defaultFormat
    : (!!props.qSuggests) 
      ? '?Q' 
      : (props.apiSuggests) 
        ? 'API' 
        : '';

    return searchFormat;
  }

  selectSuggestHandler(searchFormat):void {
    if(searchFormat === '?Q') {
      this.suggestHandler = new QHandler(this.props.qSuggests);
    } else {
      this.suggestHandler = new ApiHandler(this.props.apiSuggests);
    }
    this.setState({ isProcessing: true, suggestions: [] })
  }

  async componentDidMount() {
    this.selectSuggestHandler(this.state.searchFormat);
    if(this.state.searchFormat) {
      const suggestsItems = [...await this.suggestHandler.buildSuggestItems('')];
      this.setState({suggestions: suggestsItems});
    }
  }

  updateSuggestOnProps(qSuggestsPrev, apiSuggestsPrev) {
    const { qSuggests, apiSuggests } = this.props;
    const qSuggestsChanged = JSON.stringify(qSuggests) !== JSON.stringify(qSuggestsPrev);
    const apiSuggestsChanged = JSON.stringify(apiSuggests) !== JSON.stringify(apiSuggestsPrev);

    if (qSuggestsChanged || apiSuggestsChanged) {
      return true;
    }
    return false;

  }

  shouldComponentUpdate(nextProps, nextState){
    if (this.updateSuggestOnProps(nextProps.qSuggests, nextState.apiSuggests)){
      return true;
    }
    if (nextState.isProcessing) {
      return true;
    }
    if (nextState.isPopoverOpen !== this.state.isPopoverOpen){
      return true;
    }
    if (nextState.status !== this.state.status) {
      return true;
    }
    
    return false;
  }

  async componentDidUpdate(prevProps) {
    if (this.updateSuggestOnProps(prevProps.qSuggests, prevProps.apiSuggests)) {
      this.selectSuggestHandler(this.state.searchFormat);
    }

    const { isProcessing } = this.state;
    if (!isProcessing){
      return;
    }
    const { inputValue, isInvalid, searchFormat } = this.state;
    const { searchDisable } = this.props;
    if (isInvalid) {
      this.buildSuggestInvalid();
    } else {
      const suggestsItems = !!searchFormat ?
        [...await this.suggestHandler.buildSuggestItems(inputValue)]
        : [];
      const isSearchEnabled = (this.suggestHandler.inputStage === 'fields' 
        && !searchDisable 
        && inputValue !== '')
        || !searchFormat;
  
      if (isSearchEnabled) {
        const suggestSearch = this.buildSuggestFieldsSearch();
        suggestSearch && suggestsItems.unshift(suggestSearch);
      }
  
      await this.setState({
        status: 'unchanged',
        suggestions: suggestsItems,
        isProcessing: false,
      });
    }
  }
  
  buildSuggestInvalid() {
    const suggestsItems = [{
      type: { iconType: 'alert', color: 'tint2' },
      label: "Error",
      description: "The field are invalid"
    }];
    this.setState({
      isProcessing: false,
      suggestions: suggestsItems,
      status: 'unsaved',
    });
  }

  buildSuggestFieldsSearch():suggestItem | undefined {
    const { inputValue, searchFormat } = this.state;
    if (this.suggestHandler.isSearch || !searchFormat ) {
      const searchSuggestItem: suggestItem = {
        type: { iconType: 'search', color: 'tint8' },
        label: inputValue,
        description: 'Search'
      };
      return searchSuggestItem;
    }
  }

  makeSearch(item:suggestItem):void {
    const { inputValue, filters:currentFilters } = this.state;
    const filters = {...currentFilters};

    filters['search'] = inputValue;
    this.updateFilters(filters);
    this.setState({
      inputValue: '',
      suggestions: [],
      isProcessing: true,
      filters,
    });
  }

  makeFilter(item:suggestItem):void {
    const { inputValue, filters } = this.state;
      
    const {inputValue:newInputValue, filters:newFilters } = this.suggestHandler.onItemClick(item, inputValue, filters);
    this.updateFilters(newFilters);
    
    this.setState({
      inputValue: newInputValue,
      suggestions: [],
      status: 'loading',
      filters: newFilters,
      isProcessing: true,
    });
  }

  updateFilters(newFilters:object):void {
    const { filters } = this.state;
    if (JSON.stringify(filters) !== JSON.stringify(newFilters)) {
      this.props.onInputChange(newFilters);
      this.setState({isPopoverOpen:false});
    }
  }

  //#region Event methods

  onInputChange = (value:string) => {
    const { filters:currentFilters } = this.state;
    if (!this.state.searchFormat) {
      this.setState({
        inputValue: value,
        isProcessing: true,
      });
      return;
    }
    const { isInvalid, filters } = this.suggestHandler.onInputChange(value, currentFilters);
    if (!isInvalid) {
      this.updateFilters(filters);
    }
    this.setState({
      inputValue: value,
      isProcessing: true,
      status: 'loading',
      isInvalid,
      filters
    });
  }

  onChangeSearchFormat(format) {
    this.setState({searchFormat: format});
    this.selectSuggestHandler(format);
  }

  onKeyPress = (e:KeyboardEvent)  => {
    const { isInvalid, searchFormat } = this.state;
    if(e.key !== 'Enter' || isInvalid) {
      return;
    }
    const { inputValue, filters:currentFilters } = this.state;
    const { searchDisable } = this.props;
    let filters = {};
    let newInputValue = '';
    if ((this.suggestHandler.isSearch && !searchDisable)|| !searchFormat) {
      filters = {...currentFilters};
      filters['search'] = inputValue;
    } else if(inputValue.length > 0) {
      const { inputValue:newInput, filters:newFilters } = this.suggestHandler.onKeyPress(inputValue, currentFilters);
      filters = {...newFilters};
      newInputValue = newInput;
    }
    this.props.onInputChange(filters);
    this.setState({
      isProcessing: true,
      inputValue: newInputValue,
      filters
    });
  }

  onItemClick(item: suggestItem) {
    if (item.type.iconType === 'search') {
      this.makeSearch(item);
    } else {
      this.makeFilter(item);
    }
  }

  onDeleteBadge(badge) {
    const { filters } = this.state;
    delete filters[badge.field];
    this.props.onInputChange(filters);
    this.setState({filters, isProcessing: true});
  }

  onPopoverFocus(event) {
    this.setState({isPopoverOpen: true});
  }

  closePopover = () => {
    this.setState({isPopoverOpen: false});
  };

  //#endregion

  //#region Renderer methods

  renderFormatSelector() {
    const { qSuggests, apiSuggests } = this.props;
    const { searchFormat } = this.state;
    const qFilterEnabled = !!qSuggests;
    const apiFilterEnabled = !!apiSuggests;
    if (!qFilterEnabled && !apiFilterEnabled) {
      return null;
    }
    return (<WzSearchFormatSelector
      onChange={this.onChangeSearchFormat.bind(this)}
      format={searchFormat}
      qFilterEnabled={qFilterEnabled}
      apiFilterEnabled={apiFilterEnabled}
    />);
  }

  render() {
    const { status,
      suggestions,
      inputValue,
      isInvalid,
      filters,
      isPopoverOpen
    } = this.state;
    const { placeholder } = this.props;
    const formatedFilter = [...Object.keys(filters).map((item) => {return {field: item, value: filters[item]}})];
    const searchFormatSelector = this.renderFormatSelector();
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <WzSearchBadges
              filters={formatedFilter}
              onChange={this.onDeleteBadge.bind(this)} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiSuggest
              status={status}
              value={inputValue}
              onKeyPress={this.onKeyPress}
              onItemClick={this.onItemClick.bind(this)}
              append={searchFormatSelector}
              isPopoverOpen={isPopoverOpen}
              onClosePopover={this.closePopover.bind(this)}
              onPopoverFocus={this.onPopoverFocus.bind(this)}
              suggestions={suggestions}
              onInputChange={this.onInputChange}
              isInvalid={isInvalid}
              placeholder={placeholder}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  //#endregion
}
