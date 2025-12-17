
import { Router } from "express";
import { Server } from "socket.io";
import {
  generateGrid,
  getAllSeats,
  holdSeat,
  releaseExpiredHolds,
  bookSeats,
  getUserHeldSeats
} from "../modules/seatService"
import { releaseSeatHandler } from "../modules/seatController";


export function seatRoutes(io: Server) {

  const router = Router();


  router.post("/generate", async (req, res) => {
    try {
      const { rows, cols } = req.body;
      if (
        typeof rows !== "number" ||
        typeof cols !== "number" ||
        rows < 3 ||
        rows > 20 ||
        cols < 3 ||
        cols > 20
      ) {
        return res.status(400).json({ message: "Invalid rows/cols" });
      }

      const seats = await generateGrid(rows, cols);
      io.emit("seats:init", seats);
      res.json(seats);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  router.get("/", async (_req, res) => {
    const seats = await getAllSeats();
    res.json(seats);
  });

  router.post("/hold", async (req, res) => {
    try {
      const { row, col, userId } = req.body;
      if (
        typeof row !== "number" ||
        typeof col !== "number" ||
        typeof userId !== "string"
      ) {
        return res.status(400).json({ message: "Invalid payload" });
      }

      const seat = await holdSeat(row, col, userId);
      io.emit("seat:locked", seat);
      res.json(seat);
    } catch (err) {
      res.status(409).json({ message: (err as Error).message });
    }
  });

  router.post("/book", async (req, res) => {
    try {
      const { seatIds, userId } = req.body;
      if (!Array.isArray(seatIds) || typeof userId !== "string") {
        return res.status(400).json({ message: "Invalid payload" });
      }

      const updatedSeats = await bookSeats(seatIds, userId);
      updatedSeats.forEach((seat:any) => {
        io.emit("seat:booked", seat);
      });

      res.json(updatedSeats);
    } catch (err) {
      res.status(409).json({ message: (err as Error).message });
    }
  });


  router.get("/held/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const seats = await getUserHeldSeats(userId);
      res.json(seats);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });
  router.post("/release", (req, res) =>
    releaseSeatHandler(req, res, io)
  );
  return router;
}