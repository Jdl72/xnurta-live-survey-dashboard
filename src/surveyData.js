const sheetPalette = ['#4eb4fe', '#2869df', '#f69321', '#7cc8ff', '#8bb1ff', '#ffd08a'];

export const questionLabels = {
  confidence:
    "How confident are you explaining 'agentic AI' to your team or stakeholders?",
  trust:
    'What would have to be true for you to trust an AI agent to manage key parts of your campaign operations? (Select all that apply)',
  organization: 'Which of these best describes how your team is organised around AI today?',
  operationalDrain:
    'What is the single biggest operational drain on your retail media team right now? (e.g., time-consuming task)',
  provingValue:
    'What is your biggest challenge in proving the value of retail media investment to your stakeholders? (Select one)',
  cleanRooms:
    'How are you currently using data clean rooms in your retail media program?',
  aiUsage:
    'Roughly what percentage of your team actively uses AI tools in their day-to-day work?',
  networks:
    'How many retail media networks does your brand or agency currently advertise on?',
};

export const defaultSurveyConfig = {
  mode: 'google-sheets',
  refreshMs: 10000,
  googleSheetCsvUrl:
    'https://docs.google.com/spreadsheets/d/1Vi9p0S4sXv_Wr_d3bSFLx8WGeNmH-y7HeLl9QqV77oY/export?format=csv',
  fields: questionLabels,
  multiSelectFields: [questionLabels.trust, questionLabels.cleanRooms],
  multiSelectOptions: {
    [questionLabels.trust]: [
      'Proven, measurable ROI track record',
      'Full transparency and auditability of decisions',
      'Fine-grained human override and control capabilities',
      'Clear demarcation of responsibility/liability',
      'Integration with existing media platforms/tools',
      'Security and privacy guarantees that meet compliance standards',
      'Internal training and skill development for team members',
      'Other (Please specify)',
    ],
    [questionLabels.cleanRooms]: [
      'We are actively using clean rooms for audience enrichment/matching.',
      'We are using clean rooms for advanced measurement and attribution.',
      'We are piloting clean room technology with one or two partners.',
      'We are planning to implement clean rooms within the next 12 months.',
      'We are not currently using clean rooms and have no immediate plans to.',
    ],
  },
};

export const mockRows = [
  buildRow('Moderately confident', 'Human approval controls', 'Informal experimentation', 'Manual reporting', 'Attribution across retailers', 'Piloting one use case', '11-25%', '3-5'),
  buildRow('Slightly confident', 'Stronger performance proof', 'Informal experimentation', 'Spreadsheet wrangling', 'Attribution across retailers', 'Exploring but not live', '11-25%', '3-5'),
  buildRow('Very confident', 'Transparent decision-making', 'Dedicated AI lead or working group', 'Budget pacing and optimization', 'Linking retail media to sales outcomes', 'Piloting one use case', '26-50%', '6-10'),
  buildRow('Not confident', 'Human approval controls', 'No formal structure yet', 'Retailer-by-retailer execution', 'Stakeholder understanding of incrementality', 'Not using clean rooms yet', '0-10%', '1-2'),
  buildRow('Moderately confident', 'Reliable platform integrations', 'Cross-functional task force', 'Manual reporting', 'Attribution across retailers', 'Piloting one use case', '26-50%', '6-10'),
  buildRow('Slightly confident', 'Brand safety and governance', 'No formal structure yet', 'Retailer-by-retailer execution', 'Internal reporting consistency', 'Exploring but not live', '11-25%', '3-5'),
  buildRow('Very confident', 'Transparent decision-making', 'Dedicated AI lead or working group', 'Budget pacing and optimization', 'Stakeholder understanding of incrementality', 'Live in multiple workflows', '51-75%', '11+'),
  buildRow('Moderately confident', 'Stronger performance proof', 'Cross-functional task force', 'Manual reporting', 'Linking retail media to sales outcomes', 'Piloting one use case', '26-50%', '6-10'),
  buildRow('Slightly confident', 'Human approval controls', 'Informal experimentation', 'Creative and content trafficking', 'Attribution across retailers', 'Exploring but not live', '11-25%', '3-5'),
  buildRow('Not confident', 'Reliable platform integrations', 'No formal structure yet', 'Retailer-by-retailer execution', 'Internal reporting consistency', 'Not using clean rooms yet', '0-10%', '1-2'),
  buildRow('Moderately confident', 'Transparent decision-making', 'Cross-functional task force', 'Spreadsheet wrangling', 'Linking retail media to sales outcomes', 'Piloting one use case', '26-50%', '6-10'),
  buildRow('Very confident', 'Stronger performance proof', 'Dedicated AI lead or working group', 'Budget pacing and optimization', 'Stakeholder understanding of incrementality', 'Live in multiple workflows', '51-75%', '11+'),
  buildRow('Slightly confident', 'Brand safety and governance', 'Informal experimentation', 'Creative and content trafficking', 'Attribution across retailers', 'Exploring but not live', '11-25%', '3-5'),
  buildRow('Moderately confident', 'Human approval controls', 'Cross-functional task force', 'Manual reporting', 'Internal reporting consistency', 'Piloting one use case', '26-50%', '6-10'),
  buildRow('Very confident', 'Reliable platform integrations', 'Dedicated AI lead or working group', 'Budget pacing and optimization', 'Linking retail media to sales outcomes', 'Live in multiple workflows', '51-75%', '11+'),
  buildRow('Not confident', 'Stronger performance proof', 'No formal structure yet', 'Spreadsheet wrangling', 'Stakeholder understanding of incrementality', 'Not using clean rooms yet', '0-10%', '1-2'),
  buildRow('Moderately confident', 'Transparent decision-making', 'Informal experimentation', 'Manual reporting', 'Attribution across retailers', 'Piloting one use case', '26-50%', '6-10'),
  buildRow('Slightly confident', 'Human approval controls', 'Cross-functional task force', 'Retailer-by-retailer execution', 'Internal reporting consistency', 'Exploring but not live', '11-25%', '3-5'),
];

export async function fetchSurveyRows(config) {
  if (config.mode !== 'google-sheets') {
    return {
      rows: mockRows,
      sourceLabel: 'Demo data bundled in app',
    };
  }

  if (!config.googleSheetCsvUrl) {
    throw new Error('Add a published Google Sheets CSV URL in surveyData.js.');
  }

  const response = await fetch(config.googleSheetCsvUrl, {
    headers: {
      Accept: 'text/csv',
    },
  });

  if (!response.ok) {
    throw new Error(`Google Sheets fetch failed with status ${response.status}.`);
  }

  const csvText = await response.text();
  return {
    rows: parseCsv(csvText),
    sourceLabel: 'Google Forms via published Google Sheet',
  };
}

export function buildDashboardSnapshot(rows, config) {
  const confidenceCounts = countBy(rows, config.fields.confidence, config);
  const trustCounts = countBy(rows, config.fields.trust, config);
  const organizationCounts = countBy(rows, config.fields.organization, config);
  const drainCounts = countBy(rows, config.fields.operationalDrain, config);
  const valueCounts = countBy(rows, config.fields.provingValue, config);
  const cleanRoomCounts = countBy(rows, config.fields.cleanRooms, config);
  const aiUsageCounts = countBy(rows, config.fields.aiUsage, config);
  const networkCounts = countBy(rows, config.fields.networks, config);

  const confidenceOrder = [
    'Not confident',
    'Slightly confident',
    'Moderately confident',
    'Very confident',
  ];

  const aiUsageOrder = [
    '0% (None)',
    '1% - 25%',
    '26% - 50%',
    '51% - 75%',
    '76% - 100% (Majority)',
  ];
  const networkOrder = ['1-3 Networks', '4-7 Networks', '8-12 Networks', '13+ Networks'];

  const confidenceData = orderedEntries(confidenceCounts, confidenceOrder);
  const trustData = asSortedEntries(trustCounts).slice(0, 5);
  const organizationData = asSortedEntries(organizationCounts).map((item, index) => ({
    ...item,
    color: sheetPalette[index % sheetPalette.length],
  }));
  const drainData = asSortedEntries(drainCounts).slice(0, 5);
  const valueData = asSortedEntries(valueCounts).slice(0, 5);
  const cleanRoomData = asSortedEntries(cleanRoomCounts).slice(0, 4);
  const aiUsageData = orderedEntries(aiUsageCounts, aiUsageOrder);
  const networkData = orderedEntries(networkCounts, networkOrder);

  const confidenceScore = averageFromWeightedScale(confidenceData);
  const responseCount = rows.length;

  return {
    responseCount,
    panels: [
      {
        key: 'confidence',
        accent: 'cyan',
        chart: 'donut',
        title: 'Confidence in agentic AI',
        data: confidenceData,
        total: 4,
        value: confidenceScore,
      },
      {
        key: 'trust',
        accent: 'coral',
        chart: 'horizontal-bar',
        title: 'Trust unlocks',
        data: trustData,
      },
      {
        key: 'organization',
        accent: 'gold',
        chart: 'distribution-bar',
        title: 'AI team model',
        data: organizationData,
      },
      {
        key: 'operationalDrain',
        accent: 'mint',
        chart: 'horizontal-bar',
        title: 'Operational drain',
        data: drainData,
      },
      {
        key: 'provingValue',
        accent: 'cyan',
        chart: 'horizontal-bar',
        title: 'Proving value',
        data: valueData,
      },
      {
        key: 'cleanRooms',
        accent: 'coral',
        chart: 'donut-split',
        title: 'Clean room maturity',
        data: cleanRoomData,
      },
      {
        key: 'aiUsage',
        accent: 'gold',
        chart: 'vertical-bar',
        title: 'Daily AI usage',
        data: aiUsageData,
      },
      {
        key: 'networks',
        accent: 'mint',
        chart: 'vertical-bar',
        title: 'Network footprint',
        data: networkData,
      },
    ],
  };
}

function buildRow(
  confidence,
  trust,
  organization,
  operationalDrain,
  provingValue,
  cleanRooms,
  aiUsage,
  networks,
) {
  return {
    [questionLabels.confidence]: confidence,
    [questionLabels.trust]: trust,
    [questionLabels.organization]: organization,
    [questionLabels.operationalDrain]: operationalDrain,
    [questionLabels.provingValue]: provingValue,
    [questionLabels.cleanRooms]: cleanRooms,
    [questionLabels.aiUsage]: aiUsage,
    [questionLabels.networks]: networks,
  };
}

export function countBy(rows, fieldName, config = defaultSurveyConfig) {
  const isMultiSelect = config.multiSelectFields.includes(fieldName);

  return rows.reduce((accumulator, row) => {
    const value = (row[fieldName] || '').trim();
    if (!value) {
      return accumulator;
    }

    const values = isMultiSelect
      ? parseMultiSelectValue(value, config.multiSelectOptions[fieldName] || [])
      : [normalizeFieldValue(fieldName, value)];

    values.forEach((entry) => {
      accumulator[entry] = (accumulator[entry] || 0) + 1;
    });
    return accumulator;
  }, {});
}

function normalizeFieldValue(fieldName, value) {
  if (fieldName === questionLabels.confidence) {
    return normalizeConfidenceValue(value);
  }

  return value;
}

function normalizeConfidenceValue(value) {
  const numericValue = Number.parseFloat(value);
  if (Number.isFinite(numericValue)) {
    if (numericValue <= 2) {
      return 'Not confident';
    }
    if (numericValue <= 5) {
      return 'Slightly confident';
    }
    if (numericValue <= 8) {
      return 'Moderately confident';
    }
    return 'Very confident';
  }

  return value;
}

function parseMultiSelectValue(value, knownOptions) {
  const matches = knownOptions.filter((option) => value.includes(option));
  if (matches.length > 0) {
    return matches;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function orderedEntries(record, order) {
  return order.map((label) => ({
    label,
    value: record[label] || 0,
  }));
}

function asSortedEntries(record) {
  return Object.entries(record)
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

function averageFromWeightedScale(entries) {
  const weightedTotal = entries.reduce((sum, item, index) => sum + item.value * (index + 1), 0);
  const totalVotes = entries.reduce((sum, item) => sum + item.value, 0) || 1;
  return weightedTotal / totalVotes;
}

export function parseCsv(input) {
  const rows = [];
  const lines = input.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    return rows;
  }

  const headers = splitCsvLine(lines[0]).map(cleanCsvValue);
  for (const line of lines.slice(1)) {
    if (!line.trim()) {
      continue;
    }

    const cells = splitCsvLine(line).map(cleanCsvValue);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

export function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

function cleanCsvValue(value) {
  return value.trim();
}
