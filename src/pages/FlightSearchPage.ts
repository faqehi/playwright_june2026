import { Locator, Page } from '@playwright/test';

export class FlightSearchPage {
    private readonly page: Page;
    private readonly fromInput: Locator;
    private readonly toInput: Locator;
    private readonly tripTypeDropdown: Locator;
    private readonly datePickerInput: Locator;
    private readonly calendarConfirmButton: Locator;
    private readonly closeCalendarButton: Locator;
    private readonly searchFlightsButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.fromInput = page.getByPlaceholder('From');
        this.toInput = page.getByPlaceholder('To');
        this.tripTypeDropdown = page.locator('div[class*="TripTypeSelector__InputLabelContainer"]');
        this.datePickerInput = page.getByRole('textbox', { name: /dd\/mm\/yyyy/i });

        this.calendarConfirmButton = page.locator('div[class*="calendarfooter__FooterButtonItem"]').filter({ hasText: /confirm/i });
        this.closeCalendarButton = page.locator('div[class*="Calendar__CloseCalendar"]');
        this.searchFlightsButton = page.getByLabel('Search Flights button.');
    }

    async setFlightRoute(
        fromInput: string,
        fromSelection: string,
        toInput: string,
        toSelection: string
    ): Promise<void> {
        // Execute departure workflow
        await this.selectDeparture(fromInput, fromSelection);

        // Execute destination workflow
        await this.selectDestination(toInput, toSelection);
    }

    async selectDeparture(locationInput: string, locationSelection: string): Promise<void> {
        await this.fromInput.click();
        await this.fromInput.fill(locationInput);
        await this.page.keyboard.press('ArrowDown');
        await this.page.getByText(locationSelection).click();
    }

    async selectDestination(locationInput: string, locationSelection: string): Promise<void> {
        await this.toInput.click();
        await this.toInput.fill(locationInput);
        await this.page.keyboard.press('ArrowDown');
        await this.page.getByText(locationSelection).click();
    }

    async selectTripType(type: 'One-way' | 'Round-trip'): Promise<void> {
        await this.tripTypeDropdown.click();
        await this.page.getByText(type).click({ force: true });
    }

    async selectFutureDate(daysFromNow: number): Promise<void> {
        const targetDate = new Date();

        // Generate future dates dynamically so the test never expires
        targetDate.setDate(targetDate.getDate() + daysFromNow);

        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        const day = targetDate.getDate();

        // Reconstruct format to exactly match the site: "2026-6-23"
        const formattedDateString = `${year}-${month}-${day}`;

        await this.datePickerInput.click();

        // Need to find the specific date cell and target the exact day text
        const dateCell = this.page.locator(`#div-${formattedDateString}`).getByText(day.toString(), { exact: true });
        await dateCell.click();
        await this.calendarConfirmButton.click();
    }

    async closeCalendar(): Promise<void> {
        await this.closeCalendarButton.click();
    }

    async clickSearch(): Promise<void> {
        await this.searchFlightsButton.click();
    }


}