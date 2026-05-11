import React, { Component, useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
import signalToScaleLogoWhite from './assets/signal-to-scale-logo-white.png';
import signalToScaleLogoShadow from './assets/signal-to-scale-logo-shadow.png';
import xnurtaLogoWhite from './assets/xnurta-logo-white-2025.png';

const SECTION_ROTATE_MS = 12000;
const SLIDE_ROTATE_MS = 14000;
const SLIDE_FADE_MS = 700;
const SURVEY_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSenGJQWq_oqu62l_U345OaX-OduZHQyGE4xj0QYvwt2cyWHEw/viewform?usp=header';

function App() {
  const [rows, setRows] = useState(mockRows);
  const [viewMode, setViewMode] = useState('slides');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [visibleSlideIndex, setVisibleSlideIndex] = useState(0);
  const [fadingSlideIndex, setFadingSlideIndex] = useState(null);
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
  const sections = useMemo(
    () => [
      {
        key: 'readiness',
        eyebrow: 'AI Readiness',
        title: 'How prepared the room feels',
        layoutClass: 'section-grid-readiness',
        panels: snapshot.panels.filter((panel) =>
          ['confidence', 'trust', 'organization'].includes(panel.key),
        ),
      },
      {
        key: 'friction',
        eyebrow: 'Operational Friction',
        title: 'Where retail media teams lose the most energy',
        layoutClass: 'section-grid-friction',
        panels: snapshot.panels.filter((panel) =>
          ['operationalDrain', 'provingValue'].includes(panel.key),
        ),
      },
      {
        key: 'maturity',
        eyebrow: 'Program Maturity',
        title: 'Signals of capability, scale, and adoption',
        layoutClass: 'section-grid-maturity',
        panels: snapshot.panels.filter((panel) =>
          ['cleanRooms', 'aiUsage', 'networks'].includes(panel.key),
        ),
      },
    ],
    [snapshot.panels],
  );
  const activeSection = sections[activeSectionIndex];
  const slides = useMemo(
    () =>
      sections.flatMap((section) =>
        section.panels.map((panel) => ({
          ...panel,
          sectionEyebrow: section.eyebrow,
          sectionTitle: section.title,
        })),
      ),
    [sections],
  );
  const activeSlide = slides[activeSlideIndex];

  useEffect(() => {
    if (viewMode !== 'dashboard') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSectionIndex((current) => (current + 1) % sections.length);
    }, SECTION_ROTATE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [sections.length, viewMode]);

  useEffect(() => {
    if (viewMode !== 'slides') {
      setVisibleSlideIndex(activeSlideIndex);
      setFadingSlideIndex(null);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSlideIndex((current) => (current + 1) % slides.length);
    }, SLIDE_ROTATE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [slides.length, viewMode]);

  useEffect(() => {
    if (viewMode !== 'slides') {
      return undefined;
    }

    if (activeSlideIndex === visibleSlideIndex) {
      return undefined;
    }

    setFadingSlideIndex(visibleSlideIndex);
    setVisibleSlideIndex(activeSlideIndex);

    const timer = window.setTimeout(() => {
      setFadingSlideIndex(null);
    }, SLIDE_FADE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeSlideIndex, visibleSlideIndex, viewMode]);

  return (
    <DashboardErrorBoundary>
      <main className="page-shell">
        <div className="page-glow page-glow-left" />
        <div className="page-glow page-glow-right" />
        <header className="brand-bar">
          <div className="brand-lockup brand-lockup-event">
            <img className="event-logo" src={signalToScaleLogoWhite} alt="Signal to Scale 2026" />
            <div className="presenter-lockup">
              <span className="presenter-label">Presented by</span>
              <img className="presenter-logo" src={xnurtaLogoWhite} alt="Xnurta" />
            </div>
          </div>
          <div className="view-toggle" aria-label="Display mode">
            <button
              type="button"
              className={`view-toggle-button ${viewMode === 'slides' ? 'view-toggle-button-active' : ''}`}
              onClick={() => setViewMode('slides')}
            >
              Slide loop
            </button>
            <button
              type="button"
              className={`view-toggle-button ${viewMode === 'dashboard' ? 'view-toggle-button-active' : ''}`}
              onClick={() => setViewMode('dashboard')}
            >
              Dashboard
            </button>
          </div>
        </header>

        <section className="hero">
          <div className="hero-watermark" aria-hidden="true">
            <img src={signalToScaleLogoShadow} alt="" />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Live Audience Survey</p>
            <h1>Capturing Signal</h1>
            <p className="hero-text">
              Real-time audience sentiment from Signal to Scale 2026 across AI readiness, retail media friction, and program maturity.
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
            <span className="status-label">Summit</span>
            <strong>Signal to Scale 2026</strong>
          </div>
          <div>
            <span className="status-label">Focus</span>
            <strong>Retail media + agentic AI</strong>
          </div>
          <div>
            <span className="status-label">Presented by</span>
            <strong>Xnurta</strong>
          </div>
          {status.error ? <div className="status-error">{status.error}</div> : null}
        </section>

        {viewMode === 'slides' ? (
          <SlideLoop
            slide={slides[visibleSlideIndex]}
            fadingSlide={fadingSlideIndex === null ? null : slides[fadingSlideIndex]}
            slideIndex={visibleSlideIndex}
            slideCount={slides.length}
            onSelectSlide={setActiveSlideIndex}
            slides={slides}
          />
        ) : (
          <>
            <section className="section-switcher" aria-label="Dashboard sections">
              {sections.map((section, index) => (
                <button
                  key={section.key}
                  type="button"
                  className={`section-pill ${index === activeSectionIndex ? 'section-pill-active' : ''}`}
                  onClick={() => setActiveSectionIndex(index)}
                >
                  {section.eyebrow}
                </button>
              ))}
            </section>

            <SectionBlock
              eyebrow={activeSection.eyebrow}
              title={activeSection.title}
              layoutClass={activeSection.layoutClass}
            >
              <SectionPanels section={activeSection} />
            </SectionBlock>
          </>
        )}

        <SurveyCta />
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

function SlideLoop({ slide, fadingSlide, slideIndex, slideCount, slides, onSelectSlide }) {
  return (
    <section className="slide-loop">
      <div className="slide-stage">
        {fadingSlide ? (
          <SlideFrame
            slide={fadingSlide}
            slideIndex={fadingSlide === slide ? slideIndex : null}
            slideCount={slideCount}
            mode="exiting"
          />
        ) : null}
        <SlideFrame slide={slide} slideIndex={slideIndex} slideCount={slideCount} mode="active" />
      </div>

      <div className="slide-dots" aria-label="Slides">
        {slides.map((entry, index) => (
          <button
            key={`${entry.key}-${index}`}
            type="button"
            className={`slide-dot ${index === slideIndex ? 'slide-dot-active' : ''}`}
            aria-label={`Show ${entry.title}`}
            onClick={() => onSelectSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}

function SlideFrame({ slide, slideIndex, slideCount, mode }) {
  return (
    <div className={`slide-frame slide-frame-${mode}`}>
      <div className="slide-meta">
        <div>
          <p className="eyebrow">{slide.sectionEyebrow}</p>
          <h2>{slide.title}</h2>
        </div>
        <div className="slide-counter">
          <span>
            {(slideIndex ?? 0) + 1} / {slideCount}
          </span>
        </div>
      </div>

      <Panel title={slide.question} accent={slide.accent} variant="slide-hero">
        <DashboardErrorBoundary compact>
          <ChartRenderer panel={slide} mode="slide" />
        </DashboardErrorBoundary>
      </Panel>
    </div>
  );
}

function SurveyCta() {
  return (
    <aside className="survey-cta">
      <div className="survey-cta-copy">
        <span className="survey-cta-label">Signal to Scale live survey</span>
        <strong>Scan to answer</strong>
      </div>
      <div className="survey-qr">
        <QRCodeSVG value={SURVEY_URL} size={108} bgColor="#ffffff" fgColor="#050713" level="M" includeMargin />
      </div>
      <a className="survey-url" href={SURVEY_URL} target="_blank" rel="noreferrer">
        {SURVEY_URL}
      </a>
    </aside>
  );
}

function SectionPanels({ section }) {
  if (section.key === 'readiness') {
    return (
      <>
        <Panel
          key={section.panels[0].key}
          title={section.panels[0].title}
          accent={section.panels[0].accent}
          variant="featured"
        >
          <DashboardErrorBoundary compact>
            <ChartRenderer panel={section.panels[0]} />
          </DashboardErrorBoundary>
        </Panel>
        <div className="stack-column">
          {section.panels.slice(1).map((panel) => (
            <Panel key={panel.key} title={panel.title} accent={panel.accent} variant="compact">
              <DashboardErrorBoundary compact>
                <ChartRenderer panel={panel} />
              </DashboardErrorBoundary>
            </Panel>
          ))}
        </div>
      </>
    );
  }

  if (section.key === 'friction') {
    return section.panels.map((panel) => (
      <Panel key={panel.key} title={panel.title} accent={panel.accent} variant="wide">
        <DashboardErrorBoundary compact>
          <ChartRenderer panel={panel} />
        </DashboardErrorBoundary>
      </Panel>
    ));
  }

  return section.panels.map((panel, index) => (
    <Panel
      key={panel.key}
      title={panel.title}
      accent={panel.accent}
      variant={index === 0 ? 'maturity-featured' : 'maturity-compact'}
    >
      <DashboardErrorBoundary compact>
        <ChartRenderer panel={panel} />
      </DashboardErrorBoundary>
    </Panel>
  ));
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

function ChartRenderer({ panel, mode = 'dashboard' }) {
  switch (panel.chart) {
    case 'horizontal-bar':
      return <HorizontalBarChart data={panel.data} color={accentFill[panel.accent]} mode={mode} />;
    case 'vertical-bar':
      return <VerticalBarChart data={panel.data} color={accentFill[panel.accent]} mode={mode} />;
    case 'distribution-bar':
      return <DistributionBarChart data={panel.data} mode={mode} />;
    case 'donut':
      return (
        <ConfidenceScaleChart
          data={panel.data}
          value={panel.value}
          total={panel.total}
          accent={panel.accent}
          mode={mode}
        />
      );
    case 'donut-split':
      return <SplitDonutChart data={panel.data} mode={mode} />;
    default:
      return null;
  }
}

function HorizontalBarChart({ data, color, mode }) {
  const isSlide = mode === 'slide';
  return (
    <div className={`chart-wrap ${isSlide ? 'chart-wrap-slide' : ''}`}>
      <ResponsiveContainer width="100%" height={isSlide ? 520 : 240}>
        <RechartsBarChart data={data} layout="vertical" margin={{ top: 8, right: 64, left: 12, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="rgba(73, 73, 69, 0.12)" />
          <XAxis type="number" allowDecimals={false} tick={isSlide ? slideTickStyle : tickStyle} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={isSlide ? 320 : 210}
            tick={isSlide ? slideTickStyle : tickStyle}
            axisLine={false}
            tickLine={false}
            tickMargin={14}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} fill={color} barSize={isSlide ? 48 : 28}>
            <LabelList dataKey="value" position="right" fill="#050713" fontSize={isSlide ? 26 : 14} fontWeight={600} />
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function VerticalBarChart({ data, color, mode }) {
  const isSlide = mode === 'slide';
  return (
    <div className={`chart-wrap ${isSlide ? 'chart-wrap-slide' : ''}`}>
      <ResponsiveContainer width="100%" height={isSlide ? 520 : 250}>
        <RechartsBarChart data={data} margin={{ top: 18, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid vertical={false} stroke="rgba(73, 73, 69, 0.12)" />
          <XAxis dataKey="label" tick={isSlide ? slideCompactTickStyle : compactTickStyle} axisLine={false} tickLine={false} interval={0} tickMargin={12} />
          <YAxis allowDecimals={false} tick={isSlide ? slideTickStyle : tickStyle} axisLine={false} tickLine={false} width={isSlide ? 44 : 28} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={color} maxBarSize={isSlide ? 140 : 96}>
            <LabelList dataKey="value" position="top" fill="#050713" fontSize={isSlide ? 26 : 14} fontWeight={600} />
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DistributionBarChart({ data, mode }) {
  const isSlide = mode === 'slide';
  return (
    <div className={`chart-wrap ${isSlide ? 'chart-wrap-slide' : ''}`}>
      <ResponsiveContainer width="100%" height={isSlide ? 520 : 240}>
        <RechartsBarChart data={data} layout="vertical" margin={{ top: 8, right: 64, left: 10, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="rgba(73, 73, 69, 0.12)" />
          <XAxis type="number" allowDecimals={false} tick={isSlide ? slideTickStyle : tickStyle} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={isSlide ? 340 : 220}
            tick={isSlide ? slideTickStyle : tickStyle}
            axisLine={false}
            tickLine={false}
            tickMargin={14}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={isSlide ? 48 : 28}>
            {data.map((item) => (
              <Cell key={item.label} fill={item.color} />
            ))}
            <LabelList dataKey="value" position="right" fill="#050713" fontSize={isSlide ? 26 : 14} fontWeight={600} />
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ConfidenceScaleChart({ data, value, total, accent, mode }) {
  const isSlide = mode === 'slide';
  const weightedData = data.map((item, index) => ({
    ...item,
    scaleValue: index + 1,
    percentage: Math.round((item.value / Math.max(data.reduce((sum, row) => sum + row.value, 0), 1)) * 100),
  }));

  return (
    <div className={`confidence-scale ${isSlide ? 'confidence-scale-slide' : ''}`}>
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

function SplitDonutChart({ data, mode }) {
  const isSlide = mode === 'slide';
  return (
    <div className={`chart-wrap chart-wrap-split ${isSlide ? 'chart-wrap-slide' : ''}`}>
      <ResponsiveContainer width="100%" height={isSlide ? 360 : 220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={isSlide ? 86 : 52}
            outerRadius={isSlide ? 132 : 82}
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
const slideTickStyle = { fill: '#494945', fontSize: 24, fontWeight: 500 };
const slideCompactTickStyle = { fill: '#494945', fontSize: 20, fontWeight: 500 };

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid rgba(5, 7, 19, 0.08)',
  borderRadius: '12px',
  color: '#050713',
};

const accentFill = {
  cyan: '#6aa7eb',
  coral: '#1f2c59',
  gold: '#86b6ef',
  mint: '#27345f',
};

const accentRing = ['#6aa7eb', '#1f2c59', '#86b6ef', '#27345f', '#b7cde9'];

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
