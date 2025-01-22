import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeBoard, fakeUser, fakeList } from './utils/fakeData'

test.describe.serial('Add a list to a board', () => {
  const user = fakeUser()
  const board = fakeBoard()
  const list = fakeList()

  test('user can add a list to a board', async ({ page }) => {
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

      const addListButton = page.getByRole('button', { name: '+ Add list' })
      await expect(addListButton).toBeVisible()
      await addListButton.click()

      const entryField = page.getByPlaceholder('List name')
      await expect(entryField).toBeVisible()
      await entryField.fill(list.title)

      const checkmarkButton = page
        .locator('button')
        .filter({
          has: page.locator('svg').filter({
            has: page.locator('path[d="M5 13l4 4L19 7"]'),
          }),
        })
        .first()
      await expect(checkmarkButton).toBeVisible()
      await checkmarkButton.click()

      const listTitle = page.getByText(list.title)
      await expect(listTitle).toBeVisible()
    })
  })
})
