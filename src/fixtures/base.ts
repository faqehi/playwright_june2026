import { test as base } from '@playwright/test';
import { FlightSearchPage } from '../pages/FlightSearchPage';
import { FlightSelectionPage } from '../pages/FlightSelectionPage';
import { FlightCheckoutPage } from '../pages/FlightCheckoutPage';

export type MyFixtures = {
  flightSearchPage: FlightSearchPage;
  flightSelectionPage: FlightSelectionPage;
  flightCheckoutPage: FlightCheckoutPage;
};

export const test = base.extend<MyFixtures>({
  flightSearchPage: async ({ page }, use) => {
    await use(new FlightSearchPage(page));
  },
  flightSelectionPage: async ({ page }, use) => {
    await use(new FlightSelectionPage(page));
  },
  flightCheckoutPage: async ({ page }, use) => {
    await use(new FlightCheckoutPage(page));
  },
});

export { expect } from '@playwright/test';