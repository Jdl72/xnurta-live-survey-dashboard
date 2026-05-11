import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { makeSnapshot } from './test/fixtures';

vi.mock('recharts', () => {
  const passthrough = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: passthrough,
    BarChart: passthrough,
    PieChart: passthrough,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Bar: () => <div data-testid="bar-chart-mark" />,
    Pie: () => <div data-testid="pie-chart-mark" />,
    LabelList: () => null,
    Cell: () => null,
  };
});

vi.mock('./surveyData', async () => {
  const actual = await vi.importActual('./surveyData');
  return {
    ...actual,
    fetchSurveyRows: vi.fn(),
    buildDashboardSnapshot: vi.fn(),
  };
});

import { buildDashboardSnapshot, fetchSurveyRows, mockRows } from './surveyData';

function getMetricCard(label) {
  return screen.getByText(label).closest('.metric-card');
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildDashboardSnapshot.mockImplementation((rows) => makeSnapshot(rows.length));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders the main dashboard shell without crashing', async () => {
    fetchSurveyRows.mockResolvedValue({
      rows: mockRows.slice(0, 2),
      sourceLabel: 'Live sheet',
    });

    render(<App />);

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('heading', { name: 'Capturing Signal' })).toBeInTheDocument();
    expect(screen.getAllByText('Signal to Scale 2026').length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Live audience survey for Xnurta's executive summit on retail media, agentic AI, and measurement.",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Slide loop' })).toHaveClass('view-toggle-button-active');
    expect(screen.getByText('1 / 8')).toBeInTheDocument();
  }, 10000);

  test('refreshes data on the configured interval', async () => {
    fetchSurveyRows
      .mockResolvedValueOnce({
        rows: mockRows.slice(0, 2),
        sourceLabel: 'Live sheet',
      })
      .mockResolvedValueOnce({
        rows: mockRows.slice(0, 3),
        sourceLabel: 'Live sheet',
      });
    const intervalSpy = vi.spyOn(window, 'setInterval');

    render(<App />);

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(1));
    expect(screen.getAllByText('Signal to Scale 2026').length).toBeGreaterThan(0);
    expect(getMetricCard('Responses')).toHaveTextContent('2');

    await act(async () => {
      const refreshCallback = intervalSpy.mock.calls[0][0];
      await refreshCallback();
    });

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(2));
    expect(getMetricCard('Responses')).toHaveTextContent('3');
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 10000);
  }, 10000);

  test('shows an error state when the sheet fetch fails', async () => {
    fetchSurveyRows.mockRejectedValue(new Error('Google Sheets fetch failed with status 500.'));

    render(<App />);

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(document.querySelector('.status-error')).toHaveTextContent(
        'Google Sheets fetch failed with status 500.',
      ),
    );
    expect(screen.getByRole('heading', { name: 'Capturing Signal' })).toBeInTheDocument();
  });

  test('clears the refresh interval on unmount', async () => {
    fetchSurveyRows.mockResolvedValue({
      rows: mockRows.slice(0, 2),
      sourceLabel: 'Live sheet',
    });
    const intervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    const { unmount } = render(<App />);

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(1));
    const clearCallsBeforeUnmount = clearIntervalSpy.mock.calls.length;
    const intervalHandle = intervalSpy.mock.results[0]?.value;

    unmount();

    expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(clearCallsBeforeUnmount);
    expect(clearIntervalSpy).toHaveBeenCalledWith(intervalHandle);
  });

  test('keeps the previous dataset visible after a refresh failure', async () => {
    fetchSurveyRows
      .mockResolvedValueOnce({
        rows: mockRows.slice(0, 2),
        sourceLabel: 'Live sheet',
      })
      .mockRejectedValueOnce(new Error('Google Sheets fetch failed with status 503.'));
    const intervalSpy = vi.spyOn(window, 'setInterval');

    render(<App />);

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(1));
    expect(getMetricCard('Responses')).toHaveTextContent('2');

    await act(async () => {
      const refreshCallback = intervalSpy.mock.calls[0][0];
      await refreshCallback();
    });

    await waitFor(() =>
      expect(document.querySelector('.status-error')).toHaveTextContent(
        'Google Sheets fetch failed with status 503.',
      ),
    );
    expect(getMetricCard('Responses')).toHaveTextContent('2');
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(1);
  });

  test('toggles from slide loop to dashboard view', async () => {
    fetchSurveyRows.mockResolvedValue({
      rows: mockRows.slice(0, 2),
      sourceLabel: 'Live sheet',
    });

    render(<App />);

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(1));
    await act(async () => {
      screen.getByRole('button', { name: 'Dashboard' }).click();
    });

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass('view-toggle-button-active');
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(3);
  });

  test('auto-advances slides in slide loop mode', async () => {
    fetchSurveyRows.mockResolvedValue({
      rows: mockRows.slice(0, 2),
      sourceLabel: 'Live sheet',
    });
    const intervalSpy = vi.spyOn(window, 'setInterval');

    render(<App />);

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(1));
    expect(screen.getByText('1 / 8')).toBeInTheDocument();

    await act(async () => {
      const slideInterval = intervalSpy.mock.calls.find(([, delay]) => delay === 14000)?.[0];
      await slideInterval();
    });

    expect(screen.getByText('2 / 8')).toBeInTheDocument();
    expect(screen.getAllByText('Trust unlocks').length).toBeGreaterThan(0);
  }, 10000);

  test('auto-rotates dashboard sections after switching views', async () => {
    fetchSurveyRows.mockResolvedValue({
      rows: mockRows.slice(0, 2),
      sourceLabel: 'Live sheet',
    });
    const intervalSpy = vi.spyOn(window, 'setInterval');

    render(<App />);

    await waitFor(() => expect(fetchSurveyRows).toHaveBeenCalledTimes(1));

    await act(async () => {
      screen.getByRole('button', { name: 'Dashboard' }).click();
    });

    expect(screen.getByText('How prepared the room feels')).toBeInTheDocument();
    expect(document.querySelectorAll('.panel')).toHaveLength(3);

    await act(async () => {
      const dashboardInterval = intervalSpy.mock.calls.find(([, delay]) => delay === 12000)?.[0];
      await dashboardInterval();
    });

    expect(screen.getByText('Where retail media teams lose the most energy')).toBeInTheDocument();
    expect(document.querySelectorAll('.panel')).toHaveLength(2);
  }, 10000);
});
