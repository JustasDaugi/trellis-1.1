import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeUser, fakeBoard, fakeList, fakeCard } from './utils/fakeData'

test.describe.serial('Delete a card in a list', () => {
  const user = fakeUser({ password: 'password.123' })
  const board = fakeBoard()
  const list = fakeList()
  const card = fakeCard()

  test('user can delete a card from a list', async ({ page }) => {
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

      const listEntryField = page.getByPlaceholder('List name')
      await expect(listEntryField).toBeVisible()
      await listEntryField.fill(list.title)

      const listCheckmarkButton = page
        .locator('button')
        .filter({
          has: page.locator('svg').filter({
            has: page.locator('path[d="M5 13l4 4L19 7"]'),
          }),
        })
        .first()
      await expect(listCheckmarkButton).toBeVisible()
      await listCheckmarkButton.click()

      const listTitleElement = page.getByText(list.title)
      await expect(listTitleElement).toBeVisible()

      const listContainer = listTitleElement.locator('xpath=../..')

      const addCardButton = listContainer.getByRole('button', { name: '+ Add card' })
      await expect(addCardButton).toBeVisible()
      await addCardButton.click()

      const cardEntryField = listContainer.getByPlaceholder('Card name')
      await expect(cardEntryField).toBeVisible()
      await cardEntryField.fill(card.title)

      const cardCheckmarkButton = listContainer
        .locator('button')
        .filter({
          has: page.locator('svg').filter({
            has: page.locator('path[d="M5 13l4 4L19 7"]'),
          }),
        })
        .first()
      await expect(cardCheckmarkButton).toBeVisible()
      await cardCheckmarkButton.click()

      const cardElement = listContainer.locator(
        '.mb-2.w-full.cursor-pointer.rounded.bg-white.p-2.text-black',
        { hasText: card.title }
      )
      await expect(cardElement).toBeVisible()
      await cardElement.click()

      const cardDialog = page.locator('.w-96.rounded-md.bg-white.p-6')
      await expect(cardDialog).toBeVisible()

      const deleteButton = cardDialog.getByRole('button', { name: 'Delete' })
      await expect(deleteButton).toBeVisible()
      await deleteButton.click()

      const deleteConfirmationMessage = cardDialog.getByText(
        'Are you sure you want to delete this card?'
      )
      await expect(deleteConfirmationMessage).toBeVisible()

      await deleteButton.click()

      await expect(
        listContainer.locator('.mb-2.w-full.cursor-pointer.rounded.bg-white.p-2.text-black', {
          hasText: card.title,
        })
      ).toHaveCount(0)
    })
  })
})
