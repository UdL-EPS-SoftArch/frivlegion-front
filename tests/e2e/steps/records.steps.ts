import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When(/^I create a new record with name "([^"]*)" and description "([^"]*)" and status "([^"]*)"$/,
  async function (name: string, description: string, status: string) {
    await this.page.fill('#name', name);
    await this.page.fill('#description', description);
    await this.page.selectOption('#status', status);
    await this.page.click('button[type="submit"]');
  });

When(/^I create a new record with name "([^"]*)" and description "([^"]*)"$/,
  async function (name: string, description: string) {
    await this.page.fill('#name', name);
    await this.page.fill('#description', description);
    await this.page.click('button[type="submit"]');
  });

Then(/^I should see the record "([^"]*)" with status "([^"]*)" in the list$/,
  async function (name: string, status: string) {
    const card = this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByRole('link', { name, exact: true }) })
      .first();
    await expect(card).toBeVisible();
    await expect(card).toContainText(`Status: ${status}`);
  });

When(/^I click on the record link "([^"]*)"$/, async function (name: string) {
  await this.page.getByRole('link', { name, exact: true }).first().click();
});

Then(/^I should see the record detail page for "([^"]*)" with status "([^"]*)"$/,
  async function (name: string, status: string) {
    await expect(this.page.locator('h1')).toContainText('Record');
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(this.page.getByText(`Status: ${status}`, { exact: true })).toBeVisible();
  });
