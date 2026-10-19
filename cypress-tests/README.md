# FreeSetu Cypress BDD

![Cypress](https://img.shields.io/badge/Cypress-14.5.4-17202C?logo=cypress&logoColor=white)
![Cucumber](https://img.shields.io/badge/BDD-Cucumber-23A841?logo=cucumber&logoColor=white)
[![Azure Pipelines](https://dev.azure.com/YOUR_ORGANIZATION/YOUR_PROJECT/_apis/build/status/YOUR_PIPELINE_ID?branchName=29JulyCode)](https://dev.azure.com/YOUR_ORGANIZATION/YOUR_PROJECT/_build/latest?definitionId=YOUR_PIPELINE_ID&branchName=29JulyCode)

> Replace `YOUR_ORGANIZATION`, `YOUR_PROJECT`, and `YOUR_PIPELINE_ID` in the Azure badge after importing `azure-pipelines.yml` and creating the pipeline in Azure DevOps. The badge is not live until those values are configured.

## Overview

This repository contains a standalone Cypress end-to-end test project for the FreeSetu React/Vite application. Tests are written as Gherkin scenarios and connected to Cypress through the Cucumber preprocessor. The suite covers core page navigation, service discovery inputs, account pages, provider information, and the mocked service-search API flow.

The test project is under `cypress-tests/`; the application remains in the repository root. Running the project scripts starts the Vite app on `http://127.0.0.1:5174` and shuts it down after the test command completes.

## Tech Stack

- Cypress for browser automation and assertions
- Cucumber/Gherkin with `@badeball/cypress-cucumber-preprocessor` for readable BDD scenarios
- JavaScript ES modules and esbuild for step-definition bundling
- React and Vite for the application under test
- Azure Pipelines for CI execution

## Project Structure

```text
FreeSetu/
├── azure-pipelines.yml
├── src/
│   ├── components/                 # React application screens
│   └── utils/api.js                # Search API client
└── cypress-tests/
	├── cypress.config.js
	├── package.json
	├── README.md
	└── cypress/
		├── e2e/                    # Gherkin feature files
		├── fixtures/               # Stable mocked API responses
		└── support/
			├── commands.js         # Reusable Cypress custom commands
			├── e2e.js              # Support-file entry point
			├── pages/              # Page Object Models
			└── step_definitions/   # Gherkin-to-Cypress implementations
```

## Prerequisites

- Node.js 20 LTS (20.19 or later recommended)
- npm
- Windows, macOS, or Linux; Cypress downloads its Electron test browser during installation

## Installation

From the repository root, install both the application and test dependencies:

```sh
npm ci
npm ci --prefix cypress-tests
```

If the Cypress binary was skipped during installation, install it from the test project:

```sh
cd cypress-tests
npx cypress install
```

## Running Tests

Run commands from `cypress-tests/`.

| Goal | Command | Behavior |
| --- | --- | --- |
| Smoke tests | `npm run test:smoke` | Runs the API-search flow, including the intercepted request and results |
| Full regression, headless | `npm run test:regression` | Runs every discovered `.feature` file in headless Electron |
| Headless | `npm run test:headless` | Alias for the full regression run |
| Headed browser | `npm run test:headed` | Runs the full suite with a visible Electron browser |
| Cypress interactive runner | `npm run test:open` | Opens Cypress with the app running |
| Full suite, default | `npm test` | Runs the complete suite headlessly |

The `test:*` commands manage the local Vite server automatically on port 5174. To use a server you started yourself, run `npm run cy:run` or `npm run cy:headed`; those commands do not start the app.

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

For a local app using a non-default API service, set the API URL before running a script that starts Vite:

```powershell
$env:VITE_API_BASE_URL = 'https://staging-api.example.com'
npm run test:smoke
```

The API-search scenario intercepts `GET **/search*` and returns the local fixture, so it does not require a live search backend.

## Reporting

Cypress prints a per-feature summary and an overall pass/fail count to the terminal. A failing test causes the Cypress command and CI step to exit non-zero. Cypress saves screenshots for failed browser tests under `cypress/screenshots/`; generated screenshots, downloads, and videos are ignored by Git. Video recording is not enabled, and this project does not currently generate JUnit or HTML reports.

## CI/CD

The root `azure-pipelines.yml` defines an Azure DevOps pipeline triggered by changes to branch `29JulyCode`. It selects a Node.js 20 agent, runs `npm ci` for the application and Cypress project, and executes `npm test --prefix cypress-tests`. The BDD suite uses the same local Vite server and mocked search fixture as a developer run, so CI does not need search-service credentials.

After importing the YAML file as a pipeline in Azure DevOps, configure the badge above with the organization, project, and pipeline definition ID. Azure reports the run state using that badge URL; pipeline logs contain the Cypress feature-level and overall test summaries.

## Design Decisions

- **Page Object Model:** `cypress/support/pages/home-page.js` centralizes the home-page visit, search interaction, and result lookup. This keeps page interactions reusable and limits selector changes to one place as coverage grows. Stable `data-testid` attributes and `cy.findByDataTestid()` provide resilient element lookup.
- **Test data:** `cypress/fixtures/service-search-results.json` contains the deterministic response used by `cy.intercept()`. Tests verify the outgoing query and wait on the aliased response with `cy.wait('@serviceSearch')`, avoiding fixed sleeps and external backend dependencies.
- **Environment separation:** Cypress and Vite URLs are environment-configurable, allowing the same suite to target local or deployed environments without changing test code.

## Current Coverage

Scenarios cover the home page, navigation, account-page rendering, contact and location inputs, service categories and displayed counts, homepage statistics and benefits, footer links, and a mocked end-to-end service-search request. Account and contact forms are currently presentation-only; tests do not claim that those forms submit or persist data.