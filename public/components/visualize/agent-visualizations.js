/*
 * Wazuh app - Agents visualizations
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

export const agentVisualizations = {
  general: {
    metrics: [
      { id: 'Wazuh-App-Agents-General-Metric-alerts', description: 'Total', value: 'totalAlerts', color: 'primary' },
      { id: 'Wazuh-App-Agents-General-Level-12-alerts', description: 'Level 12 or above alerts', value: 'level12', color: 'accent' },
      { id: 'Wazuh-App-Agents-General-Authentication-failure', description: 'Authentication failure', value: 'authFailure', color: 'danger' },
      { id: 'Wazuh-App-Agents-General-Authentication-success', description: 'Authentication success', value: 'authSuccess', color: 'secondary'  },
    ],
    rows: [
      {
        height: 400,
        vis: [
          {
            title: 'Alert groups evolution',
            id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
            width: 2,
          },
          { title: 'Alerts', id: 'Wazuh-App-Agents-General-Alerts', width: 2 },
        ],
      },
      {
        height: 300,
        vis: [
          { title: 'Top 5 agents', id: 'Wazuh-App-Agents-General-Top-5-alerts', width: 1 },
          {
            title: 'Top 5 rule groups',
            id: 'Wazuh-App-Agents-General-Top-10-groups',
            width: 1,
          },
          {
            title: 'Top 5 PCI DSS Requirements',
            id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
            width: 1,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 3,
          },
          {
            title: 'Groups summary',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 2,
          },
        ],
      },
    ],
  },
  fim: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Most active users',
            id: 'Wazuh-App-Agents-FIM-Users',
            width: 1,
          },
          {
            title: 'Actions',
            id: 'Wazuh-App-Agents-FIM-Actions',
            width: 1,
          },
          {
            title: 'Events',
            id: 'Wazuh-App-Agents-FIM-Events',
            width: 2,
          },
        ],
      },
      {
        height: 230,
        vis: [
          {
            title: 'Files added',
            id: 'Wazuh-App-Agents-FIM-Files-added',
            width: 1,
          },
          {
            title: 'Files modified',
            id: 'Wazuh-App-Agents-FIM-Files-modified',
            width: 1,
          },
          {
            title: 'Files deleted',
            id: 'Wazuh-App-Agents-FIM-Files-deleted',
            width: 1,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-FIM-Alerts-summary',
          },
        ],
      },
    ],
  },
  pci: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Top 5 rule groups',
            id: 'Wazuh-App-Agents-PCI-Groups',
            width: 1,
          },
          {
            title: 'Top 5 rules',
            id: 'Wazuh-App-Agents-PCI-Rule',
            width: 1,
          },
          {
            title: 'Top 5 PCI DSS requirements',
            id: 'Wazuh-App-Agents-PCI-Requirement',
            width: 1,
          },
        ],
      },
      {
        height: 300,
        vis: [
          {
            title: 'PCI Requirements',
            id: 'Wazuh-App-Agents-PCI-Requirements',
            width: 3,
          },
          {
            title: 'Rule level distribution',
            id: 'Wazuh-App-Agents-PCI-Rule-level-distribution',
            width: 1,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-PCI-Last-alerts',
          },
        ],
      },
    ],
  },
  gdpr: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Top 5 rule groups',
            id: 'Wazuh-App-Agents-GDPR-Groups',
            width: 1,
          },
          {
            title: 'Top 5 rules',
            id: 'Wazuh-App-Agents-GDPR-Rule',
            width: 1,
          },
          {
            title: 'Top 5 GDPR requirements',
            id: 'Wazuh-App-Agents-GDPR-Requirement',
            width: 1,
          },
        ],
      },
      {
        height: 300,
        vis: [
          {
            title: 'GDPR Requirements',
            id: 'Wazuh-App-Agents-GDPR-Requirements',
            width: 3,
          },
          {
            title: 'Rule level distribution',
            id: 'Wazuh-App-Agents-GDPR-Rule-level-distribution',
            width: 1,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-GDPR-Last-alerts',
          },
        ],
      },
    ],
  },
  nist: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Stats',
            id: 'Wazuh-App-Agents-NIST-Stats',
            width: 1,
          },
          {
            title: 'Top 10 requirements',
            id: 'Wazuh-App-Agents-NIST-top-10-requirements',
            width: 1,
          },
          {
            title: 'Requirements distributed by level',
            id: 'Wazuh-App-Agents-NIST-Requirement-by-level',
            width: 2,
          },
        ],
      },
      {
        height: 300,
        vis: [
          {
            title: 'Requirements over time',
            id: 'Wazuh-App-Agents-NIST-Requirements-stacked-overtime',
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-NIST-Last-alerts',
          },
        ],
      },
    ],
  },
  hipaa: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Requirements over time',
            id: 'Wazuh-App-Agents-HIPAA-Requirements-Stacked-Overtime',
            width: 2,
          },
          {
            title: 'Top 10 requirements',
            id: 'Wazuh-App-Agents-HIPAA-top-10',
            width: 2,
          },
        ],
      },
      {
        height: 300,
        vis: [
          {
            title: 'HIPAA requirements',
            id: 'Wazuh-App-Agents-HIPAA-Burbles',
            width: 2,
          },
          {
            title: 'Requirements distribution by level',
            id: 'Wazuh-App-Agents-HIPAA-Distributed-By-Level',
            width: 1,
          },
          {
            title: 'Most common alerts',
            id: 'Wazuh-App-Agents-HIPAA-Most-Common',
            width: 1,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-HIPAA-Last-alerts',
          },
        ],
      },
    ],
  },
  vuls: {
    metrics: [
      { id: 'Wazuh-App-Agents-vuls-Metric-Critical-severity' },
      { id: 'Wazuh-App-Agents-vuls-Metric-High-severity' },
      { id: 'Wazuh-App-Agents-vuls-Metric-Medium-severity' },
      { id: 'Wazuh-App-Agents-vuls-Metric-Low-severity' },
    ],
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Alerts severity over time',
            id: 'Wazuh-App-Agents-vuls-Alerts-severity-over-time',
            width: 2,
          },
          { title: 'Most common rules', id: 'Wazuh-App-Agents-vuls-Most-common-rules', width: 2 },
        ],
      },
      {
        height: 270,
        vis: [
          {
            title: 'Most common CVEs',
            id: 'Wazuh-App-Agents-vuls-Vulnerability-Most-common-CVEs',
            width: 1,
          },
          {
            title: 'Severity distribution',
            id: 'Wazuh-App-Agents-vuls-Vulnerability-severity-distribution',
            width: 1,
          },
          {
            title: 'Commonly affected packages',
            id: 'Wazuh-App-Agents-vuls-Commonly-affected-packages',
            width: 1,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alert summary',
            id: 'Wazuh-App-Agents-vuls-Alert-summary',
          },
        ],
      },
    ],
  },
  virustotal: {
    metrics: [
      { id: 'Wazuh-App-Agents-Virustotal-Total-Malicious' },
      { id: 'Wazuh-App-Agents-Virustotal-Total-Positives' },
      { id: 'Wazuh-App-Agents-Virustotal-Total' },
    ],
    rows: [
      {
        height: 250,
        vis: [
          {
            title: 'Last scanned files',
            id: 'Wazuh-App-Agents-Virustotal-Last-Files-Pie',
            width: 1,
          },
          {
            title: 'Malicious files alerts Evolution',
            id: 'Wazuh-App-Agents-Virustotal-Malicious-Evolution',
            width: 3,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Last files',
            id: 'Wazuh-App-Agents-Virustotal-Files-Table',
          },
        ],
      },
    ],
  },
  osquery: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Most common Osquery actions',
            id: 'Wazuh-App-Agents-Osquery-most-common-osquery-actions',
            width: 1,
          },
          {
            title: 'Evolution of Osquery events per pack over time',
            id: 'Wazuh-App-Agents-Osquery-Evolution',
            width: 3,
          },
        ],
      },
      {
        height: 300,
        vis: [
          {
            title: 'Most common Osquery packs being used',
            id: 'Wazuh-App-Agents-Osquery-top-5-packs-being-used',
            width: 1,
          },
          {
            title: 'Most common rules',
            id: 'Wazuh-App-Agents-Osquery-monst-common-rules-being-fired',
            width: 3,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Overview-Osquery-Alerts-summary',
          },
        ],
      },
    ],
  },
  docker: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Top 5 images',
            id: 'Wazuh-App-Agents-Docker-top-5-images',
            width: 1,
          },
          {
            title: 'Top 5 events',
            id: 'Wazuh-App-Agents-Docker-top-5-actions',
            width: 1,
          },
          {
            title: 'Resources usage over time',
            id: 'Wazuh-App-Agents-Docker-Types-over-time',
            width: 2,
          },
        ],
      },
      {
        height: 300,
        vis: [
          {
            title: 'Events occurred evolution',
            id: 'Wazuh-App-Agents-Docker-Actions-over-time',
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-Docker-Events-summary',
          },
        ],
      },
    ],
  },
  oscap: {
    metrics: [
      { id: 'Wazuh-App-Agents-OSCAP-Last-score' },
      { id: 'Wazuh-App-Agents-OSCAP-Higher-score-metric' },
      { id: 'Wazuh-App-Agents-OSCAP-Lower-score-metric' },
    ],
    rows: [
      {
        height: 230,
        vis: [
          {
            title: 'Top 5 Scans',
            id: 'Wazuh-App-Agents-OSCAP-Scans',
            width: 1,
          },
          {
            title: 'Top 5 Profiles',
            id: 'Wazuh-App-Agents-OSCAP-Profiles',
            width: 1,
          },
          {
            title: 'Top 5 Content',
            id: 'Wazuh-App-Agents-OSCAP-Content',
            width: 1,
          },
          {
            title: 'Top 5 Severity',
            id: 'Wazuh-App-Agents-OSCAP-Severity',
            width: 1,
          },
        ],
      },
      {
        height: 230,
        vis: [
          {
            title: 'Daily scans evolution',
            id: 'Wazuh-App-Agents-OSCAP-Daily-scans-evolution',
          },
        ],
      },
      {
        height: 250,
        vis: [
          {
            title: 'Top 5 - Alerts',
            id: 'Wazuh-App-Agents-OSCAP-Top-5-Alerts',
            width: 2,
          },
          {
            title: 'Top 5 - High risk alerts',
            id: 'Wazuh-App-Agents-OSCAP-Top-5-High-risk-alerts',
            width: 2,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-OSCAP-Last-alerts',
          },
        ],
      },
    ],
  },
  ciscat: {
    metrics: [
      { id: 'Wazuh-app-Agents-CISCAT-last-scan-error' },
      { id: 'Wazuh-app-Agents-CISCAT-last-scan-fail' },
      { id: 'Wazuh-app-Agents-CISCAT-last-scan-not-checked' },
      { id: 'Wazuh-app-Agents-CISCAT-last-scan-pass' },
      { id: 'Wazuh-app-Agents-CISCAT-last-scan-score' },
      { id: 'Wazuh-app-Agents-CISCAT-last-scan-timestamp' },
      { id: 'Wazuh-app-Agents-CISCAT-last-scan-benchmark' },
      { id: 'Wazuh-app-Agents-CISCAT-last-scan-unknown' },
    ],
    rows: [
      {
        height: 320,
        vis: [
          {
            title: 'Top 5 CIS-CAT groups',
            id: 'Wazuh-app-Agents-CISCAT-top-5-groups',
            width: 6,
          },
          {
            title: 'Scan result evolution',
            id: 'Wazuh-app-Agents-CISCAT-scan-result-evolution',
            width: 4,
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-app-Agents-CISCAT-alerts-summary',
          },
        ],
      },
    ],
  },
  pm: {
    rows: [
      {
        height: 290,
        vis: [
          {
            title: 'Alerts over time',
            id: 'Wazuh-App-Agents-PM-Events-over-time',
            width: 2,
          },
          {
            title: 'Rule distribution',
            id: 'Wazuh-App-Agents-PM-Top-5-rules',
            width: 2,
          },
        ],
      },
      {
        height: 240,
        vis: [
          {
            title: 'Events per control type evolution',
            id: 'Wazuh-App-Agents-PM-Events-per-agent-evolution',
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-PM-Alerts-summary',
          },
        ],
      },
    ],
  },
  audit: {
    metrics: [
      { id: 'Wazuh-App-Agents-Audit-New-files-metric' },
      { id: 'Wazuh-App-Agents-Audit-Read-files-metric' },
      { id: 'Wazuh-App-Agents-Audit-Modified-files-metric' },
      { id: 'Wazuh-App-Agents-Audit-Removed-files-metric' },
    ],
    rows: [
      {
        height: 250,
        vis: [
          {
            title: 'Groups',
            id: 'Wazuh-App-Agents-Audit-Groups',
            width: 1,
          },
          {
            title: 'Commands',
            id: 'Wazuh-App-Agents-Audit-Commands',
            width: 1,
          },
          {
            title: 'Files',
            id: 'Wazuh-App-Agents-Audit-Files',
            width: 1,
          },
        ],
      },
      {
        height: 310,
        vis: [
          {
            title: 'Alerts over time',
            id: 'Wazuh-App-Agents-Audit-Alerts-over-time',
          },
        ],
      },
      {
        height: 570,
        vis: [
          {
            title: 'Alerts summary',
            id: 'Wazuh-App-Agents-Audit-Last-alerts',
          },
        ],
      },
    ],
  },
};
