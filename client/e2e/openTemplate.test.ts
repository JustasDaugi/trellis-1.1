import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeUser } from './utils/fakeData'

test('user can navigate to a template board from the templates page', async ({ page }) => {
  const user = fakeUser()

  await asUser(page, user, async () => {
    await page.goto('/templates')

    const boardCard = page.locator('a[href^="/templates/board/"]').first()
    await expect(boardCard).toBeVisible()

    const href = await boardCard.getAttribute('href')
    const boardIdMatch = href?.match(/\/templates\/board\/(\d+)/)
    const boardId = boardIdMatch ? boardIdMatch[1] : null

    await boardCard.click()
    await expect(page).toHaveURL(new RegExp(`/templates/board/${boardId}$`))
  })
})
