# Aidan's Driving Test

This app helps you study the Utah learner permit test using the official handbook and handbook pictures.

## How To Open It

1. Open this folder.
2. Double-click `start-quiz-app.bat`.
3. Your web browser should open the app.
4. Click a study mode.

## Best Way To Use It

1. Start with `Permit Test Mode`.
2. Answer all 50 questions.
3. Read the short explanation every time you miss one.
4. Click `Retry Missed Questions`.
5. When signs feel hard, switch to `Signs Drill`.

## Where The Answers Come From

- Utah learner permit page: `https://dld.utah.gov/learner-permit/`
- Utah driver handbook PDF: `https://dld.utah.gov/wp-content/uploads/Driver-Handbook.pdf`
- Utah official practice test page: `https://dld.utah.gov/practice-test/`

## Files

- `index.html` is the app page.
- `app.js` runs the quiz.
- `data/questions.js` stores the Utah questions.
- `assets/handbook/` stores pictures cropped from the handbook PDF.
- `scripts/extract_handbook_assets.py` rebuilds the handbook picture files.
