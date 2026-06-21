import { Page, Locator, expect } from '@playwright/test';

export class FlightSelectionPage {
  private readonly page: Page;
  private readonly flightOptions: Locator;
  private readonly loginDialog: Locator;
  private readonly continueAsGuestLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flightOptions = page.getByTestId('price-select-pressable');
    this.loginDialog = page.getByRole('dialog');
    this.continueAsGuestLink = page.getByRole('link', { name: 'Continue as guest' });
  }

  async selectFirstFlight(): Promise<void> {
    await this.flightOptions.first().click();
  }

  async validateLoginPopupAndContinueAsGuest(): Promise<void> {
    await expect(this.loginDialog).toBeVisible();
    await expect(this.loginDialog.getByText(/sign up/i)).toBeVisible();
    await this.continueAsGuestLink.click();
  }     
}