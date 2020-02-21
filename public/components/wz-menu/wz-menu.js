/*
 * Wazuh app - React component for build q queries.
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
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiButtonEmpty, EuiCallOut, EuiLoadingSpinner, EuiPopover } from '@elastic/eui';
import { AppState } from '../../react-services/app-state';
import { PatternHandler } from '../../react-services/pattern-handler';
import { WazuhConfig } from '../../react-services/wazuh-config';
import chrome from 'ui/chrome';
import { connect } from 'react-redux';
import WzReduxProvider from '../../redux/wz-redux-provider';
import store from '../../redux/store'
import WzManagementSideMenu from './management-side-menu';
import WzVisualizePopover from './wz-visualize-popover';

class WzMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      currentMenuTab: "",
      currentAPI: "",
      showSelector: false,
      theresPattern: false,
      currentPattern: "",
      patternList: [],
      currentSelectedPattern: "",
      isManagementPopoverOpen: false,
      isVisualizePopoverOpen: false,
      favoriteItems: [],
      expandedVisualize: false
    };
    this.store = store;
    this.wazuhConfig = new WazuhConfig();
  }

  async componentDidMount() {
    const $injector = await chrome.dangerouslyGetActiveInjector();
    this.indexPatterns = $injector.get('indexPatterns');

  }

  componentDidUpdate(prevProps) {
    const { name: apiName } = JSON.parse(AppState.getCurrentAPI())
    const { currentAPI } = this.state;
    if (AppState.getNavigation() && AppState.getNavigation().currLocation && AppState.getNavigation().currLocation.replace(/\//g, '') !== this.state.currentMenuTab) {
      this.setState({ currentMenuTab: AppState.getNavigation().currLocation.replace(/\//g, '') })
    }

    if (prevProps.state.showMenu !== this.props.state.showMenu || this.props.state.showMenu === true && this.state.showMenu === false) {
      this.load();
    }
    if (!currentAPI && apiName || apiName !== currentAPI) {
      this.setState({ currentAPI: apiName })
    } else {
      if (currentAPI && this.props.state.currentAPI && currentAPI !== this.props.state.currentAPI) {
        this.setState({ currentAPI: this.props.state.currentAPI });
      }
    }
  }

  async load() {
    try {
      this.setState({ showMenu: true });

      if (!this.state.currentMenuTab && AppState.getNavigation().currLocation) {
        this.setState({ currentMenuTab: AppState.getNavigation().currLocation.replace(/\//g, '') });
      }

      const list = await PatternHandler.getPatternList();
      if (!list) return;

      // Get the configuration to check if pattern selector is enabled
      const config = this.wazuhConfig.getConfig();
      AppState.setPatternSelector(config['ip.selector']);

      // Abort if we have disabled the pattern selector
      if (!AppState.getPatternSelector()) return;

      // Show the pattern selector
      this.setState({ showSelector: true });

      let filtered = false;
      // If there is no current pattern, fetch it
      if (!AppState.getCurrentPattern()) {
        AppState.setCurrentPattern(list[0].id);
      } else {
        // Check if the current pattern cookie is valid
        filtered = list.filter(item =>
          item.id.includes(AppState.getCurrentPattern())
        );
        if (!filtered.length) AppState.setCurrentPattern(list[0].id);
      }

      const data = filtered
        ? filtered
        : await this.indexPatterns.get(AppState.getCurrentPattern());
      this.setState({ theresPattern: true, currentPattern: data.title });

      // Getting the list of index patterns
      if (list) {
        this.setState({ patternList: list, currentSelectedPattern: AppState.getCurrentPattern() })
      }
    } catch (error) {
      //TODO handle error
      console.log(error)
    }
  }

  changePattern = (event) => {
    try {
      if (!AppState.getPatternSelector()) return;
      PatternHandler.changePattern(event.target.value);
      this.setState({ currentSelectedPattern: event.target.value });
      location.reload();
    } catch (err) {
      //TODO handle error
      console.log(err)
    }
  }

  buildPatternSelector() {
    return (
      <span className="small">
        <select className="wz-menu-select" value={this.state.currentSelectedPattern}
          onChange={this.changePattern} aria-label="Index pattern selector">

          {this.state.patternList.map((item, idx) => {
            return (
              <option className="wz-menu-select-option" key={idx} value={item.id}>
                {item.title}
              </option>)
          })}
        </select>
      </span>
    )
  }

  setMenuItem(item) {
    this.setState({ currentMenuTab: item })
  }

  managementPopoverToggle() {
    this.setState(state => {
      return { isManagementPopoverOpen: !state.isManagementPopoverOpen }
    });
  }

  visualizePopoverToggle() {
    this.setState(state => {
      return { isVisualizePopoverOpen: !state.isVisualizePopoverOpen }
    });
  }

  onClickManagementButton() {
    this.setMenuItem('manager');
    this.managementPopoverToggle();
  }


  onClickVisualizeButton() {
    this.setMenuItem('visualize');
    this.visualizePopoverToggle();
  }
  setFavorite(item) {
    var tmp = this.state.favoriteItems;
    tmp.push(item);
    this.setState({ favoriteItems: tmp })
  }

  getFavoriteButtons() {
    const result = this.state.favoriteItems.map((item, idx) => {
      const type = item === "Amazon AWS" ? 'logoAWS' : item === "Osquery" ? "logoOsquery" : "securityApp"
      return (
        <EuiButtonEmpty
          className={"wz-menu-button " + (this.state.currentMenuTab === "wazuh-dev" ? "wz-menu-active" : "")}
          color="text"
          href="#/wazuh-dev"
          onClick={() => this.setMenuItem('wazuh-dev')}>
          <EuiIcon type={type} color='primary' size='m' />
          <span style={{ display: "none" }}>Dev Tools</span>
        </EuiButtonEmpty>
      )
    })
    return result;
  }

  render() {


    const managementButton = (
      <EuiButtonEmpty
        className={"wz-menu-button " + (this.state.currentMenuTab === "manager" ? "wz-menu-active" : "")}
        color="text"
        onClick={this.onClickManagementButton.bind(this)}
        iconType="arrowDown"
        iconSide="right">
        <EuiIcon type='managementApp' color='primary' size='m' />Management
      </EuiButtonEmpty>);

    const visualizeButton = (
      <EuiButtonEmpty
        className={"wz-menu-button " + (this.state.currentMenuTab === "visualize" ? "wz-menu-active" : "")}
        color="text"
        onClick={this.onClickVisualizeButton.bind(this)}
        iconType="arrowDown"
        iconSide="right">
        <EuiIcon type='visualizeApp' color='primary' size='m' />Visualize
      </EuiButtonEmpty>);
    return (
      <WzReduxProvider>
        {this.state.showMenu && (
          <div>
            <div className="wz-menu-wrapper">
              <EuiFlexGroup className="wz-menu" responsive={false} direction="row">
                <EuiFlexItem >
                  <EuiFlexGroup style={{ marginLeft: "10px", marginTop: "-6px" }} className="visualize-popover">
                    <EuiButtonEmpty
                      className={"wz-menu-button " + (this.state.currentMenuTab === "overview" || this.state.currentMenuTab === "health-check" ? "wz-menu-active" : "")}
                      color="text"
                      href="#/overview"
                      onClick={() => this.setMenuItem('overview')} >
                      <EuiIcon type='metricbeatApp' color='primary' size='m' />Overview
                      </EuiButtonEmpty>

                    <EuiPopover
                      className="visualize-popover"
                      id="popoverVisualize"
                      button={visualizeButton}
                      panelClassName={this.state.expandedVisualize && 'visualize-popover full-screen' || 'visualize-popover'}
                      isOpen={this.state.isVisualizePopoverOpen}
                      closePopover={() => this.setState({ isVisualizePopoverOpen: !this.state.isVisualizePopoverOpen })}
                      anchorPosition="downLeft" >
                      <div>
                        <button
                          className="expandIcon"
                          onClick={() => this.setState({ expandedVisualize: !this.state.expandedVisualize })}>
                          <EuiIcon type='expand' color='primary'/>
                        </button>
                        <WzVisualizePopover
                          visualizePopoverToggle={this.visualizePopoverToggle.bind(this)}
                          setFavorite={(item) => this.setFavorite(item)}
                          {...this.props} />
                      </div>
                    </EuiPopover>

                    <EuiPopover
                      id="popover"
                      button={managementButton}
                      isOpen={this.state.isManagementPopoverOpen}
                      closePopover={() => this.setState({ isManagementPopoverOpen: !this.state.isManagementPopoverOpen })}
                      anchorPosition="downLeft" >
                      <WzManagementSideMenu
                        managementPopoverToggle={this.managementPopoverToggle.bind(this)}
                        {...this.props} />
                    </EuiPopover>

                    <EuiButtonEmpty
                      className={"wz-menu-button " + (this.state.currentMenuTab === "agents-preview" || this.state.currentMenuTab === 'agents' ? "wz-menu-active" : "")}
                      color="text"
                      href="#/agents-preview"
                      onClick={() => this.setMenuItem('agents-preview')}>
                      <EuiIcon type='watchesApp' color='primary' size='m' />
                      <span className="wz-menu-button-title ">Agents</span>
                    </EuiButtonEmpty>

                    <EuiButtonEmpty
                      className={"wz-menu-button " + (this.state.currentMenuTab === "wazuh-dev" ? "wz-menu-active" : "")}
                      color="text"
                      href="#/wazuh-dev"
                      onClick={() => this.setMenuItem('wazuh-dev')}>
                      <EuiIcon type='console' color='primary' size='m' />
                      <span className="wz-menu-button-title ">Dev Tools</span>
                    </EuiButtonEmpty>

                    {this.state.favoriteItems.length > 0 &&
                      this.getFavoriteButtons()
                    }

                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem grow={false} style={{ paddingTop: "6px", marginRight: "-4px", display: "inline" }}>
                  {this.state.currentAPI &&
                    (
                      <span><EuiIcon type='starFilledSpace' color="primary" size='m'></EuiIcon> {this.state.currentAPI} </span>
                    )
                  }
                  {!this.state.currentAPI &&
                    (
                      <span> No API </span>
                    )
                  }
                  &nbsp; &nbsp;
                {this.state.showSelector && this.state.theresPattern && this.state.patternList && this.state.patternList.length > 1 &&
                    (
                      this.buildPatternSelector()
                    )
                  }
                </EuiFlexItem>

                <EuiFlexItem grow={false} style={{ marginTop: "6px", marginRight: "1px" }}>
                  <EuiButtonEmpty
                    className={"wz-menu-button" + (this.state.currentMenuTab === "settings" ? " wz-menu-active" : "")}
                    href="#/settings"
                    color="text"
                    aria-label="Settings"
                    onClick={() => this.setMenuItem('settings')}>
                    <EuiIcon type='advancedSettingsApp' color='primary' size='m' />
                    <span> </span>
                  </EuiButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          </div>
        )}
        {this.props.state.wazuhNotReadyYet &&
          (
            <EuiCallOut title={this.props.state.wazuhNotReadyYet} color="warning" style={{ margin: " 60px 8px -50px 8px", }}>
              <EuiFlexGroup responsive={false} direction="row" style={{ maxHeight: "40px", marginTop: "-45px" }}>

                <EuiFlexItem>
                  <p></p>
                </EuiFlexItem>
                {this.props.state.wazuhNotReadyYet.includes("Restarting") &&
                  (
                    <EuiFlexItem grow={false}>
                      <p>
                        <EuiLoadingSpinner size="l" /> &nbsp; &nbsp;
                        </p>
                    </EuiFlexItem>
                  )
                }
                {this.props.state.wazuhNotReadyYet === "Wazuh could not be recovered." &&
                  (
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty grow={false} onClick={() => location.reload()} className="WzNotReadyButton" >
                        <span> Reload </span>
                      </EuiButtonEmpty>
                    </EuiFlexItem>

                  )
                }
              </EuiFlexGroup>
            </EuiCallOut>
          )
        }
      </WzReduxProvider>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.appStateReducers,
    currentTab: state.visualizeReducers.currentTab,
  };
};

export default connect(mapStateToProps, null)(WzMenu);