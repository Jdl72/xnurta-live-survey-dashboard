# Xnurta Live Survey Dashboard

React dashboard for displaying live conference survey results on a projector, TV, or event screen.

## What It Includes

- Live polling from Google Forms responses via Google Sheets CSV
- Xnurta-aligned presentation UI
- Recharts-based visualizations
- Unit tests with Vitest
- Browser smoke tests with Playwright

## Run Locally

```bash
npm install
npm run dev
```

## Test

```bash
npm run test
```

Or run each layer separately:

```bash
npm run test:unit
npm run test:e2e
```

## Build

```bash
npm run build
```

## Survey Configuration

Google Sheets polling and field mapping live in `src/surveyData.js`.

Additional setup notes are in `SURVEY_DASHBOARD_SETUP.md`.
