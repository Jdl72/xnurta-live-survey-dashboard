import {
  buildDashboardSnapshot,
  countBy,
  defaultSurveyConfig,
  fetchSurveyRows,
  parseCsv,
  questionLabels,
  splitCsvLine,
} from './surveyData';
import { liveSheetCsv } from './test/fixtures';

describe('surveyData', () => {
  test('splitCsvLine handles quoted commas', () => {
    const line = 'x,"a, b, c",z';
    expect(splitCsvLine(line)).toEqual(['x', 'a, b, c', 'z']);
  });

  test('parseCsv reads quoted cells and headers correctly', () => {
    const rows = parseCsv(liveSheetCsv);
    expect(rows).toHaveLength(2);
    expect(rows[0][questionLabels.trust]).toContain('Integration with existing media platforms/tools');
    expect(rows[0][questionLabels.cleanRooms]).toContain('advanced measurement and attribution');
  });

  test('parseCsv returns no rows for header-only input', () => {
    expect(parseCsv(`Timestamp,${questionLabels.confidence}\n`)).toEqual([]);
  });

  test('countBy splits multi-select values for configured fields', () => {
    const rows = [
      {
        [questionLabels.trust]:
          'Proven, measurable ROI track record, Full transparency and auditability of decisions',
      },
    ];

    const result = countBy(rows, questionLabels.trust, defaultSurveyConfig);
    expect(result['Proven']).toBeUndefined();
    expect(result['Proven, measurable ROI track record']).toBe(1);
    expect(result['Full transparency and auditability of decisions']).toBe(1);
  });

  test('countBy normalizes numeric confidence answers into display bands', () => {
    const rows = [
      { [questionLabels.confidence]: '2' },
      { [questionLabels.confidence]: '5' },
      { [questionLabels.confidence]: '8' },
      { [questionLabels.confidence]: '10' },
    ];

    const result = countBy(rows, questionLabels.confidence, defaultSurveyConfig);
    expect(result).toEqual({
      'Not confident': 1,
      'Slightly confident': 1,
      'Moderately confident': 1,
      'Very confident': 1,
    });
  });

  test('fetchSurveyRows returns bundled rows in mock mode', async () => {
    const result = await fetchSurveyRows({ ...defaultSurveyConfig, mode: 'mock' });
    expect(result.sourceLabel).toBe('Demo data bundled in app');
    expect(result.rows.length).toBeGreaterThan(0);
  });

  test('fetchSurveyRows parses live CSV data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(liveSheetCsv),
    });

    const result = await fetchSurveyRows(defaultSurveyConfig);
    expect(global.fetch).toHaveBeenCalledWith(defaultSurveyConfig.googleSheetCsvUrl, {
      headers: { Accept: 'text/csv' },
    });
    expect(result.rows).toHaveLength(2);
    expect(result.sourceLabel).toBe('Google Forms via published Google Sheet');
  });

  test('fetchSurveyRows throws on sheet fetch failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    await expect(fetchSurveyRows(defaultSurveyConfig)).rejects.toThrow(
      'Google Sheets fetch failed with status 503.',
    );
  });

  test('buildDashboardSnapshot counts multi-select selections independently', () => {
    const rows = parseCsv(liveSheetCsv);
    const snapshot = buildDashboardSnapshot(rows, defaultSurveyConfig);
    const trustPanel = snapshot.panels.find((panel) => panel.key === 'trust');
    const cleanRoomPanel = snapshot.panels.find((panel) => panel.key === 'cleanRooms');

    expect(trustPanel.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Integration with existing media platforms/tools', value: 1 }),
        expect.objectContaining({ label: 'Full transparency and auditability of decisions', value: 1 }),
      ]),
    );

    expect(cleanRoomPanel.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'We are actively using clean rooms for audience enrichment/matching.', value: 1 }),
        expect.objectContaining({ label: 'We are using clean rooms for advanced measurement and attribution.', value: 1 }),
      ]),
    );
  });

  test('buildDashboardSnapshot preserves ordered zero-value bands', () => {
    const snapshot = buildDashboardSnapshot([], defaultSurveyConfig);
    const aiUsagePanel = snapshot.panels.find((panel) => panel.key === 'aiUsage');
    const confidencePanel = snapshot.panels.find((panel) => panel.key === 'confidence');

    expect(aiUsagePanel.data.map((item) => item.label)).toEqual([
      '0% (None)',
      '1% - 25%',
      '26% - 50%',
      '51% - 75%',
      '76% - 100% (Majority)',
    ]);
    expect(confidencePanel.value).toBe(0);
  });
});
