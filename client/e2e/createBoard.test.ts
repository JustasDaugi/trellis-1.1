import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeBoard, fakeUser } from './utils/fakeData'

test.describe.serial('Create a board and navigate to it', () => {
  const board = fakeBoard()

  test('user can create a board', async ({ page }) => {
    const user = fakeUser()

    await asUser(page, user, async () => {
      await page.goto('/dashboard')
      await page.getByRole('button', { name: 'Create board' }).click()

      const dialog = page.getByRole('dialog', { name: 'Create board' })
      await expect(dialog).toBeVisible()
      await dialog.getByLabel('Board title').fill(board.title)

      const createButton = dialog.locator('button[type="submit"]')
      await expect(createButton).toBeEnabled()
      await createButton.click()
      await page.waitForURL(/\/board\/\d+$/)

      const boardTitle = page.getByRole('heading', { name: board.title })
      await expect(boardTitle).toBeVisible()
    })
  })
})
