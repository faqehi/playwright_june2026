# Playwright Automation - Airline Booking Flow

This repository contains an automated end-to-end (E2E) test script for the Airline Tickets Portal. It focuses on automating the high-business-impact "Happy Path" booking flow, ensuring the stability of the travel insurance opt-in feature during release cycles.

## 🚀 Scenarios Covered
The automated test case executes the following critical user path:
1. Searching for a flight
2. Selecting a timeslot
3. Inputting passenger details
4. Opting into the travel insurance plan
5. Verifying that the insurance plan price is correctly updated in the Fare Summary

---

## 🛠️ Prerequisites
Before running the tests, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org) (v18 or higher recommended)
* npm (comes bundled with Node.js)

---

## 💻 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd playwright_june2026
   ```

2. **Install dependencies:**
   Install Node modules and the required Playwright browser binaries:
   ```bash
   npm install
   npx playwright install
   ```

---

## 🧪 Running the Tests

You can run the automation script using the following commands:

* **Run tests in headless mode (default/fastest):**
   ```bash
   npx playwright test
   ```

* **Run tests in headed mode (to watch the browser action):**
   ```bash
   npx playwright test --headed
   ```

* **Open Playwright UI Mode (best for debugging):**
   ```bash
   npx playwright test --ui
   ```

---

## 📊 Viewing Test Reports
After the test run completes, Playwright automatically generates an HTML report. To view it, run:
```bash
npx playwright show-report
```
