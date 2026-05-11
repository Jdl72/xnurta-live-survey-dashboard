import React, { Component, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildDashboardSnapshot,
  defaultSurveyConfig,
  fetchSurveyRows,
  mockRows,
} from './surveyData';
import xnurtaLogoWhite from './assets/xnurta-logo-white.png';
import xnurtaIconColor from './assets/xnurta-icon-color.png';

function App() {
  const [rows, setRows] = useState(mockRows);
  const [status, setStatus] = useState({
    sourceLabel: 'Demo mode',
    lastUpdated: new Date(),
    responseCount: mockRows.length,
    error: '',
  });

  useEffect(() => {
    let isActive = true;

    async function refresh() {
      try {
        const result = await fetchSurveyRows(defaultSurveyConfig);
        if (!isActive) {
          return;
        }

        setRows(result.rows);
        setStatus({
          sourceLabel: result.sourceLabel,
          lastUpdated: new Date(),
          responseCount: result.rows.length,
          error: '',
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus((current) => ({
          ...current,
          lastUpdated: new Date(),
          error: error instanceof Error ? error.message : 'Unable to load survey data.',
        }));
      }
    }

    refresh();
    const timer = window.setInterval(refresh, defaultSurveyConfig.refreshMs);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, []);

  const snapshot = useMemo(
    () => buildDashboardSnapshot(rows, defaultSurveyConfig),
    [rows],
  );
  const readinessPanels = snapshot.panels.filter((panel) =>
    ['confidence', 'trust', 'organization'].includes(panel.key),
  );
  const frictionPanels = snapshot.panels.filter((panel) =>
    ['operationalDrain', 'provingValue'].includes(panel.key),
  );
  const maturityPanels = snapshot.panels.filter((panel) =>
    ['cleanRooms', 'aiUsage', 'networks'].includes(panel.key),
  );

  return (
    <DashboardErrorBoundary>
      <main className="page-shell">
        <div className="page-glow page-glow-left" />
        <div className="page-glow page-glow-right" />
        <header className="brand-bar">
          <div className="brand-lockup">
            <img className="brand-icon-image" src={xnurtaIconColor} alt="" aria-hidden="true" />
            <div>
              <img className="brand-logo" src={xnurtaLogoWhite} alt="Xnurta" />
              <p className="brand-tag">Live audience pulse</p>
            </div>
          </div>
          <div className="brand-chip">Preview mode</div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Retail Media + Agentic AI</p>
            <h1>What the room thinks</h1>
            <p className="hero-text">
              Real-time audience sentiment across AI readiness, retail media friction, and program maturity.
            </p>
          </div>

          <div className="hero-meta">
            <MetricCard label="Responses" value={snapshot.responseCount} />
            <MetricCard
              label="Updated"
              value={status.lastUpdated.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            />
          </div>
        </section>

        <section className="status-bar">
          <div>
            <span className="status-label">Source</span>
            <strong>{status.sourceLabel}</strong>
          </div>
          <div>
            <span className="status-label">Mode</span>
            <strong>{defaultSurveyConfig.mode}</strong>
          </div>
          {status.error ? <div className="status-error">{status.error}</div> : null}
        </section>

        <SectionBlock
          eyebrow="AI Readiness"
          title="How prepared the room feels"
          layoutClass="section-grid-readiness"
        >
          <Panel
            key="confidence"
            title={readinessPanels[0].title}
            accent={readinessPanels[0].accent}
            variant="featured"
          >
            <DashboardErrorBoundary compact>
              <ChartRenderer panel={readinessPanels[0]} />
            </DashboardErrorBoundary>
          </Panel>
          <div className="stack-column">
            {readinessPanels.slice(1).map((panel) => (
              <Panel
                key={panel.key}
                title={panel.title}
                accent={panel.accent}
                variant="compact"
              >
                <DashboardErrorBoundary compact>
                  <ChartRenderer panel={panel} />
                </DashboardErrorBoundary>
              </Panel>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          eyebrow="Operational Friction"
          title="Where retail media teams lose the most energy"
          layoutClass="section-grid-friction"
        >
          {frictionPanels.map((panel) => (
            <Panel
              key={panel.key}
              title={panel.title}
              accent={panel.accent}
              variant="wide"
            >
              <DashboardErrorBoundary compact>
                <ChartRenderer panel={panel} />
              </DashboardErrorBoundary>
            </Panel>
          ))}
        </SectionBlock>

        <SectionBlock
          eyebrow="Program Maturity"
          title="Signals of capability, scale, and adoption"
          layoutClass="section-grid-maturity"
        >
          {maturityPanels.map((panel) => (
            <Panel
              key={panel.key}
              title={panel.title}
              accent={panel.accent}
              variant="compact"
            >
              <DashboardErrorBoundary compact>
                <ChartRenderer panel={panel} />
              </DashboardErrorBoundary>
            </Panel>
          ))}
        </SectionBlock>
      </main>
    </DashboardErrorBoundary>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionBlock({ eyebrow, title, layoutClass, children }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className={`section-grid ${layoutClass}`}>{children}</div>
    </section>
  );
}

function Panel({ title, accent, children, variant = 'default' }) {
  return (
    <article className={`panel panel-${accent} panel-${variant}`}>
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      {children}
    </article>
  );
}

function ChartRenderer({ panel }) {
  switch (panel.chart) {
    case 'horizontal-bar':
      return <HorizontalBarChart data={panel.data} color={accentFill[panel.accent]} />;
    case 'vertical-bar':
      return <VerticalBarChart data={panel.data} color={accentFill[panel.accent]} />;
    case 'distribution-bar':
      return <DistributionBarChart data={panel.data} />;
    case 'donut':
      return (
        <ConfidenceScaleChart
          data={panel.data}
          value={panel.value}
          total={panel.total}
          accent={panel.accent}
        />
      );
    case 'donut-split':
      return <SplitDonutChart data={panel.data} />;
    default:
      return null;
  }
}

function HorizontalBarChart({ data, color }) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={240}>
        <RechartsBarChart data={data} layout="vertical" margin={{ top: 8, right: 42, left: 12, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="rgba(73, 73, 69, 0.12)" />
          <XAxis type="number" allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={210}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            tickMargin={14}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} fill={color} barSize={28}>
            <LabelList dataKey="value" position="right" fill="#050713" fontSize={14} fontWeight={600} />
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function VerticalBarChart({ data, color }) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={250}>
        <RechartsBarChart data={data} margin={{ top: 18, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid vertical={false} stroke="rgba(73, 73, 69, 0.12)" />
          <XAxis dataKey="label" tick={compactTickStyle} axisLine={false} tickLine={false} interval={0} tickMargin={12} />
          <YAxis allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={color} maxBarSize={96}>
            <LabelList dataKey="value" position="top" fill="#050713" fontSize={14} fontWeight={600} />
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DistributionBarChart({ data }) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={240}>
        <RechartsBarChart data={data} layout="vertical" margin={{ top: 8, right: 42, left: 10, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="rgba(73, 73, 69, 0.12)" />
          <XAxis type="number" allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={220}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            tickMargin={14}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={28}>
            {data.map((item) => (
              <Cell key={item.label} fill={item.color} />
            ))}
            <LabelList dataKey="value" position="right" fill="#050713" fontSize={14} fontWeight={600} />
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ConfidenceScaleChart({ data, value, total, accent }) {
  const weightedData = data.map((item, index) => ({
    ...item,
    scaleValue: index + 1,
    percentage: Math.round((item.value / Math.max(data.reduce((sum, row) => sum + row.value, 0), 1)) * 100),
  }));

  return (
    <div className="confidence-scale">
      <div className="confidence-summary">
        <div className="confidence-score">
          <strong>{value.toFixed(1)} / {total}</strong>
          <span>Average confidence</span>
        </div>
        <div className="confidence-meter" aria-hidden="true">
          <div
            className="confidence-meter-fill"
            style={{ width: `${(value / total) * 100}%`, background: accentFill[accent] }}
          />
        </div>
      </div>

      <div className="confidence-bars">
        {weightedData.map((item) => (
          <div className="confidence-row" key={item.label}>
            <div className="confidence-row-copy">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="confidence-row-track">
              <div
                className="confidence-row-fill"
                style={{
                  width: `${item.percentage}%`,
                  background: accentFill[accent],
                  opacity: 0.45 + item.scaleValue * 0.12,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SplitDonutChart({ data }) {
  return (
    <div className="chart-wrap chart-wrap-split">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((item, index) => (
              <Cell key={item.label} fill={accentRing[index % accentRing.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="split-legend">
        {data.map((item, index) => (
          <div className="split-legend-row" key={item.label}>
            <span className="legend-dot" style={{ background: accentRing[index % accentRing.length] }} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

const tickStyle = { fill: '#494945', fontSize: 14, fontWeight: 500 };
const compactTickStyle = { fill: '#494945', fontSize: 12, fontWeight: 500 };

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid rgba(5, 7, 19, 0.08)',
  borderRadius: '12px',
  color: '#050713',
};

const accentFill = {
  cyan: '#4eb4fe',
  coral: '#f69321',
  gold: '#7cc8ff',
  mint: '#2869df',
};

const accentRing = ['#4eb4fe', '#2869df', '#f69321', '#ffd08a', '#8bb1ff'];

class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    if (this.props.compact) {
      return (
        <div className="chart-error">
          <strong>Chart preview unavailable</strong>
          <span>{this.state.error.message}</span>
        </div>
      );
    }

    return (
      <main className="page-shell">
        <section className="status-bar status-bar-error">
          <div>
            <strong>Dashboard preview error:</strong> {this.state.error.message}
          </div>
        </section>
      </main>
    );
  }
}

export default App;
