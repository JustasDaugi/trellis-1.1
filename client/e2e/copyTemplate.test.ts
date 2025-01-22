import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeUser } from './utils/fakeData'

test('user can create a board from a template', async ({ page }) => {
  const user = fakeUser()

  await asUser(page, user, async () => {
    await page.goto('/templates/board/1')

    const createBoardButton = page.getByRole('button', { name: 'Create board from template' })
    await expect(createBoardButton).toBeVisible()
    await createBoardButton.click()

    const dialog = page.getByRole('dialog', { name: 'Create board from template' })
    await expect(dialog).toBeVisible()

    const selectBackgroundLabel = dialog.getByText('Select Background')
    await expect(selectBackgroundLabel).toBeVisible()

    const boardTitleInput = dialog.getByLabel('Board title')
    await expect(boardTitleInput).toBeVisible()

    const currentTitle = await boardTitleInput.inputValue()
    const newTitle = `${currentTitle} Copy`
    await boardTitleInput.fill(newTitle)

    const createButton = dialog.getByRole('button', { name: 'Create' })
    await expect(createButton).toBeVisible()
    await createButton.click()

    await page.waitForURL(/\/board\/\d+$/)

    const boardTitle = page.getByRole('heading', { name: newTitle })
    await expect(boardTitle).toBeVisible()
  })
})
