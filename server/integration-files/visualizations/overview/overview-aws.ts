/*
 * Wazuh app - Module for Overview/AWS visualizations
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
export default [
  {
    _id: 'Wazuh-App-Overview-AWS-Top-5-rules',
    _type: 'visualization',
    _source: {
      title: 'Top rules',
      visState:
        '{"title":"Top rules","type":"table","params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":2,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.id","size":500,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Rule ID"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.description","size":10,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Event"}}]}',
      uiStateJSON:
        '{"vis":{"params":{"sort":{"columnIndex":2,"direction":"desc"}}}}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-AWS-geo',
    _type: 'visualization',
    _source: {
      title: 'Geolocation map',
      visState:
        '{"title":"Geolocation map","type":"tile_map","params":{"colorSchema":"Green to Red","mapType":"Scaled Circle Markers","isDesaturated":false,"addTooltip":true,"heatClusterSize":1.5,"legendPosition":"bottomright","mapZoom":1,"mapCenter":[0,0],"wms":{"enabled":false,"options":{"format":"image/png","transparent":true}},"dimensions":{"metric":{"accessor":1,"format":{"id":"number"},"params":{},"aggType":"count"},"geohash":{"accessor":0,"format":{"id":"string"},"params":{"precision":2,"useGeocentroid":true},"aggType":"geohash_grid"},"geocentroid":{"accessor":2,"format":{"id":"string"},"params":{},"aggType":"geo_centroid"}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"geohash_grid","schema":"segment","params":{"field":"GeoLocation.location","autoPrecision":true,"precision":2,"useGeocentroid":true,"isFilteredByCollar":true,"mapZoom":1,"mapCenter":[0,0]}}]}',
      uiStateJSON:
        '{"mapZoom":2,"mapCenter":[38.685509760012025,-31.816406250000004]}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-AWS-Events-by-source',
    _type: 'visualization',
    _source: {
      title: 'Events by source over time',
      visState:
        '{"title":"Alerts by action over time","type":"area","params":{"type":"area","grid":{"categoryLines":true,"style":{"color":"#eee"},"valueAxis":"ValueAxis-1"},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"area","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"cardinal","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"left","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-24h","to":"now","mode":"quick"},"useNormalizedEsInterval":true,"interval":"auto","time_zone":"Europe/Berlin","drop_partials":false,"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.aws.source","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-AWS-Top-accounts',
    _type: 'visualization',
    _source: {
      title: 'Accounts',
      visState:
        '{"title":"Accounts","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.aws.accountId","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-AWS-Top-sources',
    _type: 'visualization',
    _source: {
      title: 'Sources',
      visState:
        '{"title":"Sources","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.aws.source","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-AWS-Top-buckets',
    _type: 'visualization',
    _source: {
      title: 'Buckets',
      visState:
        '{"title":"Buckets","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.aws.log_info.s3bucket","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-AWS-Top-regions',
    _type: 'visualization',
    _source: {
      title: 'Regions',
      visState:
        '{"title":"Regions","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.aws.region","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  /*{
    _id: 'Wazuh-App-Overview-AWS-Service-selector',
    _type: 'visualization',
    _source: {
      title: 'Service selector',
      visState:
        '{"title":"Service selector","type":"input_control_vis","params":{"controls":[{"id":"1543502225381","indexPattern":"wazuh-alerts","fieldName":"data.aws.service.serviceName","parent":"","label":"Service","type":"list","options":{"type":"terms","multiselect":true,"dynamicOptions":true,"size":5,"order":"desc"}}],"updateFiltersOnChange":true,"useTimeFilter":true,"pinFilters":false},"aggs":[]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },*/
  {
    _id: 'Wazuh-App-Overview-AWS-Events-by-s3-bucket',
    _type: 'visualization',
    _source: {
      title: 'Events by S3 bucket over time',
      visState:
        '{"title":"Alerts by action over time","type":"area","params":{"type":"area","grid":{"categoryLines":true,"style":{"color":"#eee"},"valueAxis":"ValueAxis-1"},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"area","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"cardinal","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-24h","to":"now","mode":"quick"},"useNormalizedEsInterval":true,"interval":"auto","time_zone":"Europe/Berlin","drop_partials":false,"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.aws.log_info.s3bucket","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-AWS-Alerts-summary',
    _type: 'visualization',
    _source: {
      title: 'Alerts summary',
      visState:
        '{"title":"Alerts summary","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":3,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.id","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Rule ID"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.description","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":1000,"order":"desc","orderBy":"1","customLabel":"Description"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.level","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":12,"order":"desc","orderBy":"1","customLabel":"Level"}}]}',
      uiStateJSON:
        '{"vis":{"params":{"sort":{"columnIndex":3,"direction":"desc"}}}}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
      }
    }
  }
];
