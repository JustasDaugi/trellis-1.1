import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { templateRepository } from '@server/repositories/templateRepository'
import { boardTemplateSchema } from '@server/entities/template'
import { type BoardPublic } from '@server/entities/board'

export default authenticatedProcedure
  .use(provideRepos({ templateRepository }))
  .input(
    boardTemplateSchema
      .pick({
        id: true,
        title: true,
        selectedBackground: true,
      })
      .partial({ selectedBackground: true })
  )
  .mutation(
    async ({ input, ctx: { authUser, repos } }): Promise<BoardPublic> => {
      const userId = authUser.id
      const { id, title, selectedBackground } = input

      const copiedBoard = await repos.templateRepository.copyBoard(
        id,
        userId,
        title,
        selectedBackground || undefined
      )
      if (!copiedBoard) {
        throw new Error('Failed to copy board template.')
      }
      const newBoardId = copiedBoard.id

      const listTemplates = await repos.templateRepository.findByBoardId(id)

      await Promise.all(
        listTemplates.map(async (listTemplate) => {
          const copiedList = await repos.templateRepository.copyList(
            listTemplate.id,
            newBoardId,
            userId
          )
          if (!copiedList) {
            throw new Error(
              `Failed to copy list template with ID ${listTemplate.id}.`
            )
          }
          const newListId = copiedList.id

          const cardTemplates = await repos.templateRepository.findByListId(
            listTemplate.id
          )
          await Promise.all(
            cardTemplates.map(async (cardTemplate) => {
              const copiedCard = await repos.templateRepository.copyCard(
                cardTemplate.id,
                newListId,
                userId
              )
              if (!copiedCard) {
                throw new Error(
                  `Failed to copy card template with ID ${cardTemplate.id}.`
                )
              }
              return copiedCard
            })
          )
        })
      )

      const createdBoard =
        await repos.templateRepository.findCopiedBoard(newBoardId)
      if (!createdBoard) {
        throw new Error('Failed to retrieve the newly created board.')
      }

      return createdBoard as BoardPublic
    }
  )
