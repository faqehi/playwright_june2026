import { test, expect } from '../src/fixtures/base';
import testData from '../src/test-data/testData.json';

test('TC01: Verify insurance plan price updates dynamically during checkout', async ({ page, flightSearchPage, flightSelectionPage, flightCheckoutPage }) => {
  const { departureLocationInput, departureLocationSelection, destinationLocationInput, destinationLocationSelection, daysFromNow } = testData.validSearch;
  const { firstName, lastName, dob, email, mobile } = testData.passengerInfo;

  await page.goto('/');

  await flightSearchPage.selectTripType('One-way');
  await flightSearchPage.selectFutureDate(daysFromNow);
  await flightSearchPage.setFlightRoute(departureLocationInput, departureLocationSelection, destinationLocationInput, destinationLocationSelection);
  await flightSearchPage.closeCalendar();
  await flightSearchPage.clickSearch();

  await flightSelectionPage.selectFirstFlight();
  await flightSelectionPage.validateLoginPopupAndContinueAsGuest();

  await flightCheckoutPage.fillPersonalDetails(firstName, lastName);
  await flightCheckoutPage.fillDateOfBirth(dob);
  await flightCheckoutPage.fillContactDetails(email, mobile);
  await flightCheckoutPage.validateFareSummary();
  await flightCheckoutPage.clickContinueToAddOns();

  const plansAvailable = await flightCheckoutPage.areBothInsurancePlansAvailable();

  if (plansAvailable) {
    await flightCheckoutPage.selectComprehensivePlus();

    const [baseFarePrice, initialAddOnsPrice] = await flightCheckoutPage.getFareBreakdownConcurrently();
    expect(baseFarePrice).toBeGreaterThan(0);

    await flightCheckoutPage.selectLitePlan();

    const updatedAddOnsPrice = await flightCheckoutPage.getAddOns();
    expect(updatedAddOnsPrice).toBeLessThan(initialAddOnsPrice);
  } else {
    await flightCheckoutPage.selectFallbackInsurance();

    const [fallbackBasePrice, fallbackAddOnsPrice] = await flightCheckoutPage.getFareBreakdownConcurrently();
    expect(fallbackBasePrice).toBeGreaterThan(0);
    expect(fallbackAddOnsPrice).toBeGreaterThan(0);
  }
});
