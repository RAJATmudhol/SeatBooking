import { Request, Response } from "express";
import { Server } from "socket.io";
import { holdSeat, bookSeats,releaseSeat } from "./seatService";
import { holdSeatSchema, bookSchema } from "../validators/seatSchema";


export async function holdSeatHandler(
  req: Request,
  res: Response,
  io: Server
) {
  try {
    const data = holdSeatSchema.parse(req.body);
    const seat = await holdSeat(data.row, data.col, data.userId);

    io.emit("seat:locked", seat); 
    res.json(seat);
  } catch (err) {
    res.status(409).json({ message: (err as Error).message });
  }
}

export async function bookHandler(
  req: Request,
  res: Response,
  io: Server
) {
  try {
    const data = bookSchema.parse(req.body);
    await bookSeats(data.seatIds, data.userId);

    io.emit("seat:booked", data.seatIds); 
    res.json({ success: true });
  } catch (err) {
    res.status(409).json({ message: (err as Error).message });
  }
}

export async function releaseSeatHandler(
  req: Request,
  res: Response,
  io: Server
) {
  try {
    const { row, col, userId } = req.body;
    const seat = await releaseSeat(row, col, userId);

    io.emit("seat:released", seat); 
    res.json(seat);
  } catch (err) {
    res.status(409).json({ message: (err as Error).message });
  }
}
