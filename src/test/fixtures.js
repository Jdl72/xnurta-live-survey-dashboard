import { questionLabels } from '../surveyData';

export const liveSheetCsv = `Timestamp,${questionLabels.confidence},"${questionLabels.trust}",${questionLabels.organization},"${questionLabels.operationalDrain}",${questionLabels.provingValue},${questionLabels.cleanRooms},${questionLabels.aiUsage},${questionLabels.networks}
5/8/2026 13:23:38,4,"Clear demarcation of responsibility/liability, Integration with existing media platforms/tools","A few team members are champions/power users of AI tools, but it's not centralized.",Reconciling performance data and reporting across networks,Lack of standardized measurement across different networks,"We are actively using clean rooms for audience enrichment/matching., We are using clean rooms for advanced measurement and attribution.",51% - 75%,4-7 Networks
5/8/2026 13:24:12,8,"Proven, measurable ROI track record, Full transparency and auditability of decisions","We have a dedicated AI/ML team supporting media operations.","Manual campaign setup and trafficking across multiple networks",Difficulty linking retail media spend directly to profit/in-store sales,We are planning to implement clean rooms within the next 12 months.,26% - 50%,8-12 Networks
`;

export function makePanel(key, overrides = {}) {
  const base = {
    accent: 'cyan',
    title: key,
    question: `${key} question`,
    data: [{ label: 'A', value: 1 }],
  };

  if (key === 'confidence') {
    return {
      key,
      chart: 'donut',
      total: 4,
      value: 2.5,
      data: [
        { label: 'Not confident', value: 1 },
        { label: 'Slightly confident', value: 1 },
        { label: 'Moderately confident', value: 1 },
        { label: 'Very confident', value: 1 },
      ],
      ...base,
      ...overrides,
    };
  }

  if (key === 'cleanRooms') {
    return {
      key,
      chart: 'donut-split',
      ...base,
      data: [
        { label: 'Active', value: 2 },
        { label: 'Piloting', value: 1 },
      ],
      ...overrides,
    };
  }

  if (key === 'organization') {
    return {
      key,
      chart: 'distribution-bar',
      ...base,
      data: [{ label: 'Centralized', value: 2, color: '#4eb4fe' }],
      ...overrides,
    };
  }

  if (key === 'aiUsage' || key === 'networks') {
    return {
      key,
      chart: 'vertical-bar',
      ...base,
      ...overrides,
    };
  }

  return {
    key,
    chart: 'horizontal-bar',
    ...base,
    ...overrides,
  };
}

export function makeSnapshot(responseCount = 2) {
  return {
    responseCount,
    panels: [
      makePanel('confidence', { title: 'Confidence in agentic AI' }),
      makePanel('trust', { title: 'Trust unlocks', accent: 'coral' }),
      makePanel('organization', { title: 'AI team model', accent: 'gold' }),
      makePanel('operationalDrain', { title: 'Operational drain', accent: 'mint' }),
      makePanel('provingValue', { title: 'Proving value' }),
      makePanel('cleanRooms', { title: 'Clean room maturity', accent: 'coral' }),
      makePanel('aiUsage', { title: 'Daily AI usage', accent: 'gold' }),
      makePanel('networks', { title: 'Network footprint', accent: 'mint' }),
    ],
  };
}
