import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ConfirmationPage extends BasePage {
  private get confirmationNumber(): Locator {
    return this.page.locator('[data-testid="confirmation-number"]');
  }

  private get bookingSummary(): Locator {
    return this.page.locator('[data-testid="booking-summary"]');
  }

  private get appointmentDate(): Locator {
    return this.page.locator('[data-testid="appointment-date"]');
  }

  private get appointmentService(): Locator {
    return this.page.locator('[data-testid="appointment-service"]');
  }

  private get amountPaid(): Locator {
    return this.page.locator('[data-testid="amount-paid"]');
  }

  private get viewAppointmentsLink(): Locator {
    return this.page.getByRole('link', { name: /view appointments|my bookings/i });
  }

  private get bookAnotherButton(): Locator {
    return this.page.getByRole('button', { name: /book another|new appointment/i });
  }

  async getConfirmationNumber(): Promise<string> {
    return this.getText(this.confirmationNumber);
  }

  async getBookingSummary(): Promise<string> {
    return this.getText(this.bookingSummary);
  }

  async getAppointmentDate(): Promise<string> {
    return this.getText(this.appointmentDate);
  }

  async getServiceName(): Promise<string> {
    return this.getText(this.appointmentService);
  }

  async getAmountPaid(): Promise<string> {
    return this.getText(this.amountPaid);
  }

  async goToMyAppointments(): Promise<void> {
    await this.clickWhenReady(this.viewAppointmentsLink);
  }

  async bookAnotherAppointment(): Promise<void> {
    await this.clickWhenReady(this.bookAnotherButton);
    await this.waitForUrl(/\/appointments/);
  }
}
