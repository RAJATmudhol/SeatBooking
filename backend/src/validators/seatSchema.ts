import { z } from "zod";

export const holdSeatSchema = z.object({
  row: z.number().min(1),
  col: z.number().min(1),
  userId: z.string().min(1)
});

export const bookSchema = z.object({
  seatIds: z.array(z.string()),
  userId: z.string()
});
