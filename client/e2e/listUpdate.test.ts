import { test, expect } from '@playwright/test';
import { asUser } from './utils/api';
import { fakeUser, fakeBoard, fakeList } from './utils/fakeData';

test.describe.serial('Add and update a list in a board', () => {
  const user = fakeUser({ password: 'password.123' });
  const board = fakeBoard();
  const list = fakeList();
  const updatedListName = 'Updated List Name';

  test('user can add and update a list in a board', async ({ page }) => {
    await asUser(page, user, async () => {
      await page.goto('/dashboard');
      await page.getByRole('button', { name: 'Create board' }).click();

      const dialog = page.getByRole('dialog', { name: 'Create board' });
      await expect(dialog).toBeVisible();
      await dialog.getByLabel('Board title').fill(board.title);

      const createButton = dialog.locator('button[type="submit"]');
      await expect(createButton).toBeEnabled();
      await createButton.click();
      await page.waitForURL(/\/board\/\d+$/);

      const boardTitle = page.getByRole('heading', { name: board.title });
      await expect(boardTitle).toBeVisible();

      const addListButton = page.getByRole('button', { name: '+ Add list' });
      await expect(addListButton).toBeVisible();
      await addListButton.click();

      const entryField = page.getByPlaceholder('List name');
      await expect(entryField).toBeVisible();
      await entryField.fill(list.title);

      const checkmarkButton = page.locator('button').filter({
        has: page.locator('svg').filter({
          has: page.locator('path[d="M5 13l4 4L19 7"]'),
        }),
      }).first();
      await expect(checkmarkButton).toBeVisible();
      await checkmarkButton.click();

      const listTitle = page.getByText(list.title);
      await expect(listTitle).toBeVisible();

      const optionsButton = page.locator('[data-testid="dropdown-toggle"]');
      await expect(optionsButton).toBeVisible();
      await optionsButton.click();

      const changeNameButton = page.getByRole('button', { name: 'Change name' });
      await expect(changeNameButton).toBeVisible();
      await changeNameButton.click();

      const dialogUpdate = page.locator('.fixed.inset-0.z-20').filter({
        hasText: 'Change Name',
      });
      await expect(dialogUpdate).toBeVisible();

      const nameField = dialogUpdate.locator('input[type="text"]');
      await expect(nameField).toBeVisible();

      const currentName = await nameField.inputValue();
      expect(currentName).toBe(list.title);

      await nameField.fill(updatedListName);

      const confirmButton = dialogUpdate.locator('button:has-text("Confirm")');
      await expect(confirmButton).toBeVisible();
      await confirmButton.click();
      const updatedListTitle = page.getByText(updatedListName);
      await expect(updatedListTitle).toBeVisible();
    });
  });
});
