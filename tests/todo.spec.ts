import { test, expect, Locator } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';

// Read and parse the YAML data outside the test block
const filePath = path.resolve(__dirname, '../data/testData.yaml');
const fileContent = fs.readFileSync(filePath, 'utf8');
const testData = parse(fileContent);

test('hasInsurancePlan', async ({ page }) => {
  // Navigate to the AirAsia homepage
  await page.goto('https://www.airasia.com/en/gb');

  // Choosing departure via data-driven config
  const { departureLocationInput, departureLocationSelection } = testData.searchData;
  await page.getByPlaceholder('From').click();
  await page.getByPlaceholder('From').fill(departureLocationInput);
  await page.keyboard.press('ArrowDown'); 
  await page.getByText(departureLocationSelection).click();
  
  // Navigate to book one way ticket
  const dropdownTrigger: Locator = page.locator('div[class*="TripTypeSelector__InputLabelContainer"]');
  await dropdownTrigger.click();
  await page.getByText('One-way').click({ force: true });

  // Choosing flight date
  // Generate future dates dynamically so the test never expires
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 21); // Always select a date 21 days from today
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();

  // Reconstruct format to exactly match the site: "2026-6-23"
  const formattedDateString = `${year}-${month}-${day}`;

  // Open the date picker
  await page.getByRole('textbox', { name: /dd\/mm\/yyyy/i }).click();

  // Find the specific date cell and target the exact day text
  const dateCell = page.locator(`#div-${formattedDateString}`).getByText(day, { exact: true });
  await dateCell.click();

  // Click confirm inside the calendar
  const confirmButton: Locator = page
    .locator('div[class*="calendarfooter__FooterButtonItem"]')
    .filter({ hasText: /confirm/i });
  await confirmButton.click();
  
  // Choosing destination via data-driven config
  const { destinationLocationInput, destinationLocationSelection } = testData.searchData;
  await page.getByPlaceholder('To').click();
  await page.getByPlaceholder('To').fill(destinationLocationInput);
  await page.keyboard.press('ArrowDown'); 
  await page.getByText(destinationLocationSelection).click();

  // Close the Calendar popup
  const closeCalendar: Locator = page.locator('div[class*="Calendar__CloseCalendar"]');
  await closeCalendar.click();

  // Validate and search for flights
  await page.getByLabel('Search Flights button.').click();

  // Selecting first flight timeslot
  const flightOptions = page.getByTestId('price-select-pressable');
  await flightOptions.first().click(); 

  // Validating for User Login/Signup popup and continue as guest
  const loginDialog = page.getByRole('dialog'); 
  await expect(loginDialog).toBeVisible();
  await expect(loginDialog.getByText(/sign up/i)).toBeVisible();
  await page.getByRole('link', { name: 'Continue as guest' }).click();

  // Filling in Personal Info
  await page.getByRole('textbox', { name: /first\/given name/i }).fill('Mike');
  await page.keyboard.press('Escape'); //Clearing Name Guide popup when filling First Name
  await page.getByRole('textbox', { name: /family name\/surname/i }).fill('Ken');
  
  // Fill Date of Birth
  const dobInput = page.getByRole('textbox', { name: /dd\/mm\/yyyy/i });
  await dobInput.fill('12/12/1990');
  await dobInput.press('Enter'); 

  // Open the Contact Details section
  await page.getByText(/Contact details/i).click();
  // Tick the checkbox to use passenger details for contact info
  await page
  .locator('div[class*="GuestPersonalInfo__FieldWrapper"]')
  .locator('div[class*="Checkbox__OptionWrapper"]')
  .first()
  .click();
  // Fill in Contact Details
  await page.getByRole('textbox', { name: /email/i }).fill('mikeken90@gmail.com');
  const mobileInput = page.locator('input[label="Mobile number"]');
  await mobileInput.click();
  await mobileInput.fill('017-505 5445');
  
  // Validate Fare summary displayed
  await expect(page.getByText('Base fareMYR')).toBeVisible();
  await expect(page.getByText('Taxes, fees & surcharges')).toBeVisible();
  await expect(page.getByText('Add-onsMYR')).toBeVisible();
  await expect(page.getByText('Total amountMYR')).toBeVisible();

  // Setup precise locators using prefix matching
  const baseFareLocator = page.locator('div[class^="FareBreakdown__ContainerWrapper"]').filter({ hasText: 'Base fare' });
  const addOnsLocator = page.locator('div[class^="FareBreakdown__ContainerWrapper"]').filter({ hasText: 'Add-ons' });

  // Helper function to extract and parse prices safely
  const getPrice = async (locator: Locator, regex: RegExp): Promise<number> => {
    await expect(locator).toContainText(regex);
    const text: string = await locator.textContent() || '';
    const match: RegExpMatchArray | null = text.match(/MYR\s*([\d.]+)/);
    return match ? parseFloat(match[1]) : 0; // Fixed to parse the captured group [1]
  };

  // Extract initial prices concurrently, to be used later
  const baseFareRegex = /Base fare\s*MYR\s*\d+\.\d{2}/;
  const addOnsRegex = /Add-ons\s*MYR\s*\d+\.\d{2}/;

  // Open the addons section
  await page.getByText(/continue to add-ons/i).click();

  // Check if both Insurance plans are available without throwing an error if they aren't
  const isComprehensivePlusVisible = await page.getByText(/comprehensive plus/i).isVisible();
  const isLitePlanVisible = await page.getByText(/lite plan/i).isVisible();

  if (isComprehensivePlusVisible && isLitePlanVisible) {
  console.log("Comprehensive PLUS vs. Comprehensive LITE insurance plan available. Proceeding with standard flow.");
  
  // Choosing the Comprehensive PLUS insurance plan
  await page.locator('.check-box', { hasText: /comprehensive plus/i }).click();
 
  // Fetch the prices concurrently
  const [baseFarePrice, initialAddOnsPrice] = await Promise.all([
    getPrice(baseFareLocator, baseFareRegex),
    getPrice(addOnsLocator, addOnsRegex)
  ]);
  console.log('Base Fare:', baseFarePrice, 'Comprehensive PLUS AddOns:', initialAddOnsPrice); 

  // Trigger UI change by clicking Lite Plan
  await page.locator('.check-box', { hasText: /lite plan/i }).click();

  // Fetch the updated price
  const updatedAddOnsPrice = await getPrice(addOnsLocator, addOnsRegex);
  console.log('Comprehensive LITE:', updatedAddOnsPrice);

  } else {
  console.log("Only 1 Insurance plan available. Switching to fallback route.");
  
  // Run fallback route, choosing Travel Comfort/Flight Delay insurance plan
  await page.locator('.check-box', { hasText: /travel comfort|flight delay/i }).click();
  
  // Fetch the prices concurrently
  const [fallbackBasePrice, fallbackAddOnsPrice] = await Promise.all([
    getPrice(baseFareLocator, baseFareRegex),
    getPrice(addOnsLocator, addOnsRegex)
  ]);
  console.log('Base Fare:', fallbackBasePrice, 'Travel Comfort/Flight Delay AddOns:', fallbackAddOnsPrice);
}
});
