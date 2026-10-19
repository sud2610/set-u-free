# FreeSetu Cypress BDD

![Cypress](https://img.shields.io/badge/Cypress-14.5.4-17202C?logo=cypress&logoColor=white)
![Cucumber](https://img.shields.io/badge/BDD-Cucumber-23A841?logo=cucumber&logoColor=white)
[![Cypress tests](https://github.com/sud2610/set-u-free/actions/workflows/cypress-tests.yml/badge.svg)](https://github.com/sud2610/set-u-free/actions/workflows/cypress-tests.yml)

## Overview

This repository contains a standalone Cypress end-to-end test project for the FreeSetu web application. Tests are written as Gherkin scenarios and connected to Cypress through the Cucumber preprocessor. The suite covers core page navigation, service discovery inputs, account pages, provider information, and the mocked service-search API flow. The application itself is not included in this repository; run the suite against a deployed instance or a separately started local app.

The test project is under `cypress-tests/`.

## Tech Stack

- Cypress for browser automation and assertions
- Cucumber/Gherkin with `@badeball/cypress-cucumber-preprocessor` for readable BDD scenarios
- JavaScript ES modules and esbuild for step-definition bundling
- GitHub Actions for CI execution

## Project Structure

```text
set-u-free/
├── .github/workflows/
│   └── cypress-tests.yml           # Manually triggered Cypress CI workflow
└── cypress-tests/
	├── cypress.config.js
	├── package.json
	├── README.md
	└── cypress/
		├── e2e/                    # Gherkin feature files
		├── fixtures/               # Stable mocked API responses
		└── support/
			├── commands.js         # Reusable Cypress custom commands
			├── e2e.js              # Support hooks and entry point
			├── pages/
			│   └── home-page.js    # Page Object for page interactions and assertions
			└── step_definitions/   # Gherkin-to-Cypress implementations
```

## Prerequisites

- Node.js 20 LTS (20.19 or later recommended)
- npm
- Windows, macOS, or Linux; Cypress downloads its Electron test browser during installation

## Installation

From the repository root, install the test dependencies:

```sh
npm ci --prefix cypress-tests
```

If the Cypress binary was skipped during installation, install it from the test project:

```sh
cd cypress-tests
npx cypress install
```

## Running Tests

Run commands from `cypress-tests/` against an already-running application:

```powershell
$env:CYPRESS_APP_BASE_URL = 'https://your-deployed-app.example'
npm run cy:run
```

| Goal | Command | Behavior |
| --- | --- | --- |
| Full regression, headless | `npm run cy:run` | Runs every discovered `.feature` file in headless Electron |
| Headed browser | `npm run cy:headed` | Runs the full suite with a visible Electron browser |
| Cypress interactive runner | `npm run cy:open` | Opens Cypress with the app available at the configured base URL |

The Cypress commands do not start the application server. Set `CYPRESS_APP_BASE_URL` to its URL or make it available at the default `http://127.0.0.1:5174`.

## Environment Configuration

The Cypress base URL and application API URL are configurable without editing source files:

- `CYPRESS_APP_BASE_URL` sets the URL Cypress visits. It defaults to `http://127.0.0.1:5174`.
- `VITE_API_BASE_URL` sets the service-search API base URL. It defaults to `http://localhost:3001`.

For example, in PowerShell, point Cypress at an already-running test environment:

```powershell
cd cypress-tests
$env:CYPRESS_APP_BASE_URL = 'https://staging.example.com'
npm run cy:run
```

For an application configured with a non-default API service, set `VITE_API_BASE_URL` in that application's environment before starting it:

```powershell
$env:VITE_API_BASE_URL = 'https://staging-api.example.com'
```

The API-search scenario intercepts `GET **/search*` and returns the local fixture, so it does not require a live search backend.

## Reporting

Cypress prints a per-feature summary and an overall pass/fail count to the terminal. A failing test causes the Cypress command and CI step to exit non-zero. Each passing scenario saves a viewport screenshot under `cypress/screenshots/`, named after the scenario; Cypress also saves screenshots for failures. The GitHub Actions run produces a JSON test report and uploads it with scenario screenshots as the `cypress-evidence` artifact. The run summary shows pass/fail counts and links to the pipeline run. Generated screenshots, results, downloads, and videos are ignored by Git. Video recording is not enabled.

## CI/CD

The `.github/workflows/cypress-tests.yml` workflow can be started manually from the GitHub Actions tab. Enter the deployed FreeSetu application URL when starting the workflow; the test suite runs against that URL and publishes its JSON report and screenshots as downloadable artifacts. A run summary includes test counts and a link to the pipeline run. The repository does not currently include a local application package that CI can start.

To capture evidence of a pipeline run, open the linked run in the GitHub Actions tab and take a screenshot of its summary; the actual run page is generated by GitHub and is not a repository file.

## Design Decisions

- **Page Object Model:** `cypress/support/pages/home-page.js` centralizes page visits, search and navigation interactions, selectors, and common page assertions. Step definitions describe the scenario and delegate UI work to this object. Stable `data-testid` attributes and `cy.findByDataTestid()` provide resilient element lookup.
- **Test data:** `cypress/fixtures/service-search-results.json` contains the deterministic response used by `cy.intercept()`. Tests verify the outgoing query and wait on the aliased response with `cy.wait('@serviceSearch')`, avoiding fixed sleeps and external backend dependencies.
- **Environment separation:** Cypress and Vite URLs are environment-configurable, allowing the same suite to target local or deployed environments without changing test code.

## Current Coverage

Scenarios cover the home page, navigation, account-page rendering, contact and location inputs, service categories and displayed counts, homepage statistics and benefits, footer links, and a mocked end-to-end service-search request. Account and contact forms are currently presentation-only; tests do not claim that those forms submit or persist data.