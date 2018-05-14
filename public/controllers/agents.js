/*
 * Wazuh app - Agents controller
 * Copyright (C) 2018 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import beautifier    from 'plugins/wazuh/utils/json-beautifier';
import * as modules  from 'ui/modules'
import FilterHandler from './filter-handler'

const app = modules.get('app/wazuh', []);

app.controller('agentsController', function ($timeout, $scope, $location, $q, $rootScope, appState, genericReq, apiReq, AgentsAutoComplete, errorHandler, $window) {
    const filterHandler = new FilterHandler(appState.getCurrentPattern());
    $rootScope.wzCurrentFilters = [];
    $rootScope.completedAgent = false;
    $rootScope.page = 'agents';
    $scope.extensions = appState.getExtensions().extensions;
    $scope.agentsAutoComplete = AgentsAutoComplete;

    // Check the url hash and retrieve the tabView information
    if ($location.search().tabView){
        $scope.tabView = $location.search().tabView;
    } else { // If tabView doesn't exist, default it to 'panels'
        $scope.tabView = "panels";
        $location.search("tabView", "panels");
    }

    // Check the url hash and retrivew the tab information
    if ($location.search().tab){
        $scope.tab = $location.search().tab;
    } else { // If tab doesn't exist, default it to 'general'
        $scope.tab = "general";
        $location.search("tab", "general");
    }

    // Metrics Audit
    const metricsAudit = {
        auditNewFiles     : '[vis-id="\'Wazuh-App-Agents-Audit-New-files-metric\'"]',
        auditReadFiles    : '[vis-id="\'Wazuh-App-Agents-Audit-Read-files-metric\'"]',
        auditModifiedFiles: '[vis-id="\'Wazuh-App-Agents-Audit-Modified-files-metric\'"]',
        auditRemovedFiles : '[vis-id="\'Wazuh-App-Agents-Audit-Removed-files-metric\'"]'
    }

    // Metrics Vulnerability Detector
    const metricsVulnerability = {
        vulnCritical: '[vis-id="\'Wazuh-App-Agents-VULS-Metric-Critical-severity\'"]',
        vulnHigh    : '[vis-id="\'Wazuh-App-Agents-VULS-Metric-High-severity\'"]',
        vulnMedium  : '[vis-id="\'Wazuh-App-Agents-VULS-Metric-Medium-severity\'"]',
        vulnLow     : '[vis-id="\'Wazuh-App-Agents-VULS-Metric-Low-severity\'"]'
    }

    // Metrics Scap
    const metricsScap = {
        scapLastScore   : '[vis-id="\'Wazuh-App-Agents-OSCAP-Last-score\'"]',
        scapHighestScore: '[vis-id="\'Wazuh-App-Agents-OSCAP-Higher-score-metric\'"]',
        scapLowestScore : '[vis-id="\'Wazuh-App-Agents-OSCAP-Lower-score-metric\'"]'
    }

    // Metrics Virustotal
    const metricsVirustotal = {
        virusMalicious: '[vis-id="\'Wazuh-App-Agents-Virustotal-Total-Malicious\'"]',
        virusPositives: '[vis-id="\'Wazuh-App-Agents-Virustotal-Total-Positives\'"]',
        virusTotal    : '[vis-id="\'Wazuh-App-Agents-Virustotal-Total\'"]'
    }

    $rootScope.tabVisualizations = {
        general      : 7,
        fim          : 8,
        pm           : 4,
        vuls         : 7,
        oscap        : 13,
        audit        : 15,
        pci          : 3,
        virustotal   : 6,
        configuration: 0
    };

    // Object for matching nav items and Wazuh groups
    const tabFilters = {
        general   : { group: '' },
        fim       : { group: 'syscheck' },
        pm        : { group: 'rootcheck' },
        vuls      : { group: 'vulnerability-detector' },
        oscap     : { group: 'oscap' },
        audit     : { group: 'audit' },
        pci       : { group: 'pci_dss' },
        virustotal: { group: 'virustotal' }
    };

    let filters = []
    const assignFilters = (tab,agent) => {
        try {
            filters = [];

            filters.push(filterHandler.managerQuery(
                appState.getClusterInfo().status == 'enabled' ? 
                appState.getClusterInfo().cluster : 
                appState.getClusterInfo().manager
            ))
    
            if(tab !== 'general'){
                if(tab === 'pci') {
                    filters.push(filterHandler.pciQuery())
                } else {
                    filters.push(filterHandler.ruleGroupQuery(tabFilters[tab].group));
                }
            }
    
            filters.push(filterHandler.agentQuery(agent));
            $rootScope.$emit('wzEventFilters',{filters});
            if(!$rootScope.$$listenerCount['wzEventFilters']){
                $timeout(100)
                .then(() => assignFilters(tab,agent))
            }
        } catch (error){
            console.log(error.message || error)
        }
    }

    const generateMetric = id => {
        let html = $(id).html();
        if (typeof html !== 'undefined' && html.includes('<span')) {
            if(typeof html.split('<span>')[1] !== 'undefined'){
                return html.split('<span>')[1].split('</span')[0];
            } else if(html.includes('table') && html.includes('cell-hover')){
                let nonB = html.split('ng-non-bindable')[1];
                if(nonB &&
                    nonB.split('>')[1] &&
                    nonB.split('>')[1].split('</')[0]
                ) {
                    return nonB.split('>')[1].split('</')[0];
                }
            }
        }
        return '';
    }

    const createMetrics = metricsObject => {
        for(let key in metricsObject) {
            $scope[key] = () => generateMetric(metricsObject[key]);
        }
    }

    const checkMetrics = (tab, subtab) => {
        if(subtab === 'panels'){
            switch (tab) {
                case 'audit':
                    createMetrics(metricsAudit);
                    break;
                case 'vuls':
                    createMetrics(metricsVulnerability);
                    break;
                case 'oscap':
                    createMetrics(metricsScap);
                    break;
                case 'virustotal':
                    createMetrics(metricsVirustotal);
                    break;
            }
        }

        if(!$rootScope.$$phase) $rootScope.$digest();
    }

    // Switch subtab
    $scope.switchSubtab = subtab => {
        if($scope.tabView === subtab) return;
        if(subtab === 'panels' && $scope.tab !== 'configuration'){
            $rootScope.rawVisualizations = null;

            // Create current tab visualizations
            genericReq.request('GET',`/api/wazuh-elastic/create-vis/agents-${$scope.tab}/${appState.getCurrentPattern()}`)
            .then(data => {
                $rootScope.rawVisualizations = data.data.raw;
                // Render visualizations
                $rootScope.$broadcast('updateVis');

                checkMetrics($scope.tab, 'panels');
            })
            .catch(error => errorHandler.handle(error, 'Agents'));
        } else {
            checkMetrics($scope.tab, subtab);
        }
    }

    // Switch tab
    $scope.switchTab = tab => {
        if ($scope.tab === tab) return;
        assignFilters(tab, $scope.agent.id);
        if(tab !== 'configuration') {
            $rootScope.rawVisualizations = null;
            // Create current tab visualizations
            genericReq.request('GET',`/api/wazuh-elastic/create-vis/agents-${tab}/${appState.getCurrentPattern()}`)
            .then(data => {
                $rootScope.rawVisualizations = data.data.raw;
                // Render visualizations
                $rootScope.$broadcast('updateVis');

                checkMetrics(tab, 'panels');

            })
            .catch(error => errorHandler.handle(error, 'Agents'));
        }
    };

    // Watchers

    // We watch the resultState provided by the discover
    $scope.$watch('tabView', () => {
        $location.search('tabView', $scope.tabView);
        $rootScope.$emit('changeTabView',{tabView:$scope.tabView})
        if ($rootScope.ownHandlers) {
            for (let h of $rootScope.ownHandlers) {
                h._scope.$destroy();
            }
        }
        $rootScope.ownHandlers = [];

        $rootScope.loadedVisualizations = [];
    });

    $scope.$watch('tab', () => {

        $location.search('tab', $scope.tab);
        $scope.tabView = 'panels';

        if ($rootScope.ownHandlers) {
            for (let h of $rootScope.ownHandlers) {
                h._scope.$destroy();
            }
        }
        $rootScope.ownHandlers = [];

        $rootScope.loadedVisualizations = [];

        if($scope.tab === 'configuration'){
            firstLoad();
        }

    });

    // Agent data
    $scope.getAgentStatusClass = (agentStatus) => agentStatus === "Active" ? "teal" : "red";

    $scope.formatAgentStatus = (agentStatus) => {
        return ['Active','Disconnected'].includes(agentStatus) ? agentStatus : 'Never connected';
    };

    const calculateMinutes = (start,end) => {
        let time    = new Date(start);
        let endTime = new Date(end);
        let minutes = ((endTime - time) / 1000) / 60;
        return minutes;
    }

    const validateRootCheck = () => {
        $scope.agent.rootcheck.duration = 'Unknown';
        if ($scope.agent.rootcheck.end && $scope.agent.rootcheck.start) {
            $scope.agent.rootcheck.duration = ((new Date($scope.agent.rootcheck.end) - new Date($scope.agent.rootcheck.start))/1000)/60;
            $scope.agent.rootcheck.duration = Math.round($scope.agent.rootcheck.duration * 100) / 100;

            if($scope.agent.rootcheck.duration <= 0){
                $scope.agent.rootcheck.inProgress = true;
            }
        } else {
            if (!$scope.agent.rootcheck.end) {
                $scope.agent.rootcheck.end = 'Unknown';
            }
            if (!$scope.agent.rootcheck.start){
                $scope.agent.rootcheck.start = 'Unknown';
            }
        }
    }

    const validateSysCheck = () => {
        $scope.agent.syscheck.duration = 'Unknown';
        if ($scope.agent.syscheck.end && $scope.agent.syscheck.start) {
            $scope.agent.syscheck.duration = ((new Date($scope.agent.syscheck.end) - new Date($scope.agent.syscheck.start))/1000)/60;
            $scope.agent.syscheck.duration = Math.round($scope.agent.syscheck.duration * 100) / 100;
            if($scope.agent.syscheck.duration <= 0){
                $scope.agent.syscheck.inProgress = true;
            }
        } else {
            if (!$scope.agent.syscheck.end) {
                $scope.agent.syscheck.end = 'Unknown';
            }
            if (!$scope.agent.syscheck.start){
                $scope.agent.syscheck.start = 'Unknown';
            }
        }
    }

    /** Prevents from double agent and come from autocomplete */
    let lastAgent = null;


    $scope.getAgent = async (newAgentId,fromAutocomplete) => {
        try {
            $rootScope.completedAgent = false;
            if($scope.tab === 'configuration'){
                return $scope.getAgentConfig(newAgentId);
            }

            let id = null;

            // They passed an id
            if (newAgentId) {
                id = newAgentId;
                $location.search('agent', id);
            } else {
                if ($location.search().agent && !$rootScope.globalAgent) { // There's one in the url
                    id = $location.search().agent;
                } else { // We pick the one in the rootScope
                    id = $rootScope.globalAgent;
                    $location.search('agent', id);
                    delete $rootScope.globalAgent;
                }
            }


            if (id === '000' && $scope.tab === 'configuration') {
                $scope.tab = 'general';
                $scope.switchTab('general');
            }

            const data = await Promise.all([
                apiReq.request('GET', `/agents/${id}`, {}),
                apiReq.request('GET', `/syscheck/${id}/last_scan`, {}),
                apiReq.request('GET', `/rootcheck/${id}/last_scan`, {})
            ]);

            // Agent
            $scope.agent = data[0].data.data;
            lastAgent    = data[0].data.data.id;
            if ($scope.agent.os) {
                $scope.agentOS = $scope.agent.os.name + ' ' + $scope.agent.os.version;
            }
            else { $scope.agentOS = 'Unkwnown' };

            // Syscheck
            $scope.agent.syscheck = data[1].data.data;
            validateSysCheck();

            // Rootcheck
            $scope.agent.rootcheck = data[2].data.data;
            validateRootCheck();

            $rootScope.completedAgent = true;
            assignFilters($scope.tab, id);
            //assignFilters($location.search().tab,$location.search().agent);
            if(!$scope.$$phase) $scope.$digest();
            return;
        } catch (error) {
            errorHandler.handle(error,'Agents');
            if(!$rootScope.$$phase) $rootScope.$digest();
        }
    };

    $scope.goGroups = agent => {
        $rootScope.wzCurrentFilters = [];
        $rootScope.globalAgent = agent;
        $scope.agentsAutoComplete.reset();
        if($rootScope.ownHandlers) {
            for(let h of $rootScope.ownHandlers){
                h._scope.$destroy();
            }
        }
        $rootScope.ownHandlers = [];
        $rootScope.comeFrom    = 'agents';
        //$location.search('_a',null);
        $location.search('tab', 'groups');
        $location.path('/manager');
    };

    $scope.analyzeAgents = async search => {
        try {
            await $timeout(200);
            $scope.agentsAutoComplete.filters = [];
            await $scope.agentsAutoComplete.addFilter('search',search);

            if(!$scope.$$phase) $scope.$digest();
            return $scope.agentsAutoComplete.items;
        } catch (error) {
            errorHandler.handle(error,'Agents');
            if(!$rootScope.$$phase) $rootScope.$digest();
        }

    }

    //Load
    try {
        if($scope.tab !== 'configuration'){
            $scope.getAgent();
        }
        $scope.agentsAutoComplete.nextPage('');
    } catch (e) {
        errorHandler.handle('Unexpected exception loading controller','Agents');
        if(!$rootScope.$$phase) $rootScope.$digest();
    }

    //Destroy
    $scope.$on("$destroy", () => {
        delete $rootScope.wzWaitForAgent;
        $location.search('_a',null)
        $rootScope.rawVisualizations = null;
        $scope.agentsAutoComplete.reset();
        if($rootScope.ownHandlers) {
            for(let h of $rootScope.ownHandlers){
                h._scope.$destroy();
            }
        }
        $rootScope.ownHandlers = [];
        $rootScope.wzCurrentFilters = [];
    });

    //PCI tab
    let tabs = [];
    genericReq.request('GET', '/api/wazuh-api/pci/all')
        .then((data) => {
            for(let key in data.data){
                tabs.push({
                    "title": key,
                    "content": data.data[key]
                });
            }
        })
        .catch(error => {
            errorHandler.handle(error,'Agents');
            if(!$rootScope.$$phase) $rootScope.$digest();
        });

    $scope.tabs          = tabs;
    $scope.selectedIndex = 0;

    $scope.isArray = angular.isArray;

    const getAgent = newAgentId => {

        // They passed an id
        if (newAgentId) {
            $location.search('agent', newAgentId);
        }

    };

    $scope.getAgentConfig = newAgentId => {
        getAgent(newAgentId);
        firstLoad();
    }

    $scope.goGroup = () => {
        delete $rootScope.wzWaitForAgent;
        $rootScope.globalAgent = $scope.agent;
        $rootScope.comeFrom    = 'agents';
        $location.path('/manager/groups');
    };

    const firstLoad = async () => {
        try{
            $rootScope.completedAgent = false;
            $scope.configurationError = false;
            $scope.load = true;
            let id;
            if ($location.search().agent && !$rootScope.globalAgent) { // There's one in the url
                id = $location.search().agent;
            } else { // We pick the one in the rootScope
                id = $rootScope.globalAgent;
                $location.search('agent', id);
                delete $rootScope.globalAgent;
            }

            let data         = await apiReq.request('GET', `/agents/${id}`, {});
            $scope.agent     = data.data.data;
            $scope.groupName = $scope.agent.group;

            if(!$scope.groupName){

                $scope.configurationError = true;
                $scope.load = false;
                if($scope.agent.id === '000'){
                    $scope.configurationError = false;
                    $scope.tab = 'general';
                    $scope.switchTab('general');
                }
                if(!$scope.$$phase) $scope.$digest();
                return;
            }

            data                      = await apiReq.request('GET', `/agents/groups/${$scope.groupName}/configuration`, {});
            $scope.groupConfiguration = data.data.data.items[0];
            $scope.rawJSON            = beautifier.prettyPrint(data.data.data.items);

            data = await Promise.all([
                apiReq.request('GET', `/agents/groups?search=${$scope.groupName}`, {}),
                apiReq.request('GET', `/agents/groups/${$scope.groupName}`, {})
            ]);


            let filtered          = data[0].data.data.items.filter(item => item.name === $scope.groupName);
            $scope.groupMergedSum = (filtered.length) ? filtered[0].merged_sum : 'Unknown';

            filtered              = data[1].data.data.items.filter(item => item.id === $scope.agent.id);
            $scope.agentMergedSum = (filtered.length) ? filtered[0].merged_sum : 'Unknown';
            $scope.isSynchronized = (($scope.agentMergedSum === $scope.groupMergedSum) && !([$scope.agentMergedSum,$scope.groupMergedSum].includes('Unknown')) ) ? true : false;

            $scope.load = false;

            $rootScope.completedAgent = true;

            if(!$scope.$$phase) $scope.$digest();
            return;
        } catch (error){
            errorHandler.handle(error,'Agents');
            if(!$rootScope.$$phase) $rootScope.$digest();
        }
    }
    /** End of agent configuration */
    if($scope.tab !== 'configuration'){
        $rootScope.rawVisualizations = null;
        // Create visualizations for controller's first execution
        genericReq.request('GET',`/api/wazuh-elastic/create-vis/agents-${$scope.tab}/${appState.getCurrentPattern()}`)
        .then(data => {
            $rootScope.rawVisualizations = data.data.raw;
            // Render visualizations
            $rootScope.$broadcast('updateVis');

            checkMetrics($scope.tab,'panels');
        })
        .catch(error => errorHandler.handle(error, 'Agents'));
    }
});
