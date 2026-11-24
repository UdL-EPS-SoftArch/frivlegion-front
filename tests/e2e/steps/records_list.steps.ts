import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from 'playwright';

When('I logout', async function () {
  await this.page.click('text="Logout"');
  await expect(this.page).toHaveURL('http://localhost:3000/');
});

When(/^I click the link "([^"]*)"$/, async function (label: string) {
  await this.page.getByRole('link', { name: label, exact: true }).first().click();
});

Then('I should see the records page', async function () {
  await expect(this.page.locator('h1')).toContainText('Records');
});

function recordCard(page: Page, name: string) {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByRole('link', { name, exact: true }) })
    .first();
}

Then(/^I should see the record "([^"]*)" in the records list$/, async function (name: string) {
  await expect(recordCard(this.page, name)).toBeVisible();
});

Then(/^I should not see the record "([^"]*)" in the records list$/, async function (name: string) {
  await expect(recordCard(this.page, name)).toHaveCount(0);
});
