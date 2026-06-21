import { Page, Locator, expect } from '@playwright/test';

export class FlightCheckoutPage {
    private readonly page: Page;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly dobInput: Locator;
    private readonly contactDetailsSection: Locator;
    private readonly sameAsPassengerCheckbox: Locator;
    private readonly emailInput: Locator;
    private readonly mobileInput: Locator;
    private readonly baseFareLabel: Locator;
    private readonly taxesLabel: Locator;
    private readonly addOnsLabel: Locator;
    private readonly totalAmountLabel: Locator;
    private readonly baseFareContainer: Locator;
    private readonly addOnsContainer: Locator;
    private readonly continueToAddOnsButton: Locator;
    private readonly comprehensivePlusText: Locator;
    private readonly litePlanText: Locator;
    private readonly comprehensivePlusCheckbox: Locator;
    private readonly litePlanCheckbox: Locator;
    private readonly fallbackCheckbox: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameInput = page.getByRole('textbox', { name: /first\/given name/i });
        this.lastNameInput = page.getByRole('textbox', { name: /family name\/surname/i });
        this.dobInput = page.getByRole('textbox', { name: /dd\/mm\/yyyy/i });
        this.contactDetailsSection = page.getByText(/Contact details/i);
        this.sameAsPassengerCheckbox = page.locator('div[class*="GuestPersonalInfo__FieldWrapper"]').locator('div[class*="Checkbox__OptionWrapper"]').first();
        this.emailInput = page.getByRole('textbox', { name: /email/i });
        this.mobileInput = page.locator('input[label="Mobile number"]');
        this.baseFareLabel = page.getByText('Base fare');
        this.taxesLabel = page.getByText('Taxes, fees & surcharges');
        this.addOnsLabel = page.getByText('Add-onsMYR');
        this.totalAmountLabel = page.getByText('Total amountMYR');
        this.baseFareContainer = page.locator('div[class*="FareBreakdown__ContainerWrapper"]').filter({ hasText: 'Base fare' });
        this.addOnsContainer = page.locator('div[class*="FareBreakdown__ContainerWrapper"]').filter({ hasText: 'Add-ons' });
        this.continueToAddOnsButton = page.getByText(/continue to add-ons/i);
        this.comprehensivePlusText = page.getByText(/comprehensive plus/i);
        this.litePlanText = page.getByText(/lite plan/i);
        this.comprehensivePlusCheckbox = page.locator('.check-box', { hasText: /comprehensive plus/i });
        this.litePlanCheckbox = page.locator('.check-box', { hasText: /lite plan/i });
        this.fallbackCheckbox = page.locator('.check-box', { hasText: /travel comfort|flight delay/i });
    }

    async fillPersonalDetails(firstName: string, lastName: string) {
        await this.firstNameInput.fill(firstName);
        await this.page.keyboard.press('Escape');
        await this.lastNameInput.fill(lastName);
    }

    async fillDateOfBirth(dob: string) {
        await this.dobInput.fill(dob);
        await this.dobInput.press('Enter');
    }

    async fillContactDetails(email: string, mobile: string) {
        await this.contactDetailsSection.click();
        await this.sameAsPassengerCheckbox.click();
        await this.emailInput.fill(email);
        await this.mobileInput.click();
        await this.mobileInput.fill(mobile);
    }

    async validateFareSummary() {
        await expect(this.baseFareLabel).toBeVisible();
        await expect(this.taxesLabel).toBeVisible();
        await expect(this.addOnsLabel).toBeVisible();
        await expect(this.totalAmountLabel).toBeVisible();
    }

    // Helper method to extract and parse prices safely
    async getPrice(locator: Locator, regex: RegExp): Promise<number> {
        await expect(locator).toContainText(regex);
        const text: string = await locator.textContent() || '';
        const match: RegExpMatchArray | null = text.match(/MYR\s*([\d.]+)/);
        return match ? parseFloat(match[1]!) : 0; 
    }

    async getBaseFare(): Promise<number> {
        const baseFareRegex = /Base fare\s*MYR\s*\d+\.\d{2}/;
        return this.getPrice(this.baseFareContainer, baseFareRegex);
    }

    async getAddOns(): Promise<number> {
        const addOnsRegex = /Add-ons\s*MYR\s*\d+\.\d{2}/;
        return this.getPrice(this.addOnsContainer, addOnsRegex);
    }

    async clickContinueToAddOns() {
        await this.continueToAddOnsButton.click();
    }

    async areBothInsurancePlansAvailable(): Promise<boolean> {
        const isComprehensivePlusVisible = await this.comprehensivePlusText.isVisible();
        const isLitePlanVisible = await this.litePlanText.isVisible();
        return isComprehensivePlusVisible && isLitePlanVisible;
    }
    async selectComprehensivePlus() {
        await this.comprehensivePlusCheckbox.click();
    }

    async selectLitePlan() {
        await this.litePlanCheckbox.click();
    }

    async selectFallbackInsurance() {
        await this.fallbackCheckbox.click();
    }

    async getFareBreakdownConcurrently(): Promise<[number, number]> {
        return Promise.all([
            this.getBaseFare(),
            this.getAddOns()
        ]);
    }
}