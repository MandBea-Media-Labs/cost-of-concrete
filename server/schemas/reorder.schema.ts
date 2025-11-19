import { z } from 'zod'

export const reorderPagesSchema = z.object({
  pages: z.array(
    z.object({
      id: z.string().uuid(),
      display_order: z.number().int().min(0),
      parent_id: z.string().uuid().nullable()
    })
  ).min(1)
})

export type ReorderPagesInput = z.infer<typeof reorderPagesSchema>
