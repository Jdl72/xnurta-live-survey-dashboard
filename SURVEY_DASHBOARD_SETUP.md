# Conference Survey Dashboard

This React app is built to show live survey results on a TV, projector, or side-stage display.

## Current Setup

- `src/App.jsx` renders a presentation-friendly live dashboard.
- `Recharts` powers the chart components, which makes it easier to add more chart types quickly.
- `src/surveyData.js` contains:
  - demo survey responses for design/testing
  - a polling adapter for Google Sheets CSV
  - configurable field names that should match your Google Form question titles
- `src/styles.css` uses CSS variables so we can quickly apply your brand guidelines once you share them.

## How To Run

```bash
npm run dev
```

## Recommended Google Forms Flow

1. Create the Google Form.
2. Link it to a Google Sheet in Google Forms responses.
3. In Google Sheets, publish the response sheet to the web as CSV.
4. Open `src/surveyData.js` and:
   - change `mode` from `"mock"` to `"google-sheets"`
   - paste the published CSV URL into `googleSheetCsvUrl`
   - update the `fields` labels so they exactly match your Google Form question text

## Best Survey Question Types For Live Charts

- Multiple choice
- Dropdown
- Linear scale
- Checkbox with limited answer options

Avoid long free-response questions for the projected screen. They work better as moderator notes than as a live chart.

## Good Live-Screen Survey Examples

- Which topic should we spend more time discussing?
- What is your biggest challenge right now?
- How energized are you feeling right now?
- Where did you travel from?

## Next Design Pass

Once you share the brand guidelines, I can tune:

- colors
- typography
- logo placement
- motion
- sponsor / conference identity
- any “big screen” layout preferences
