// src/services/seatService.ts
import mongoose from "mongoose";
import { Seat, SeatDoc } from "../model/seat";

export async function generateGrid(rows: number, cols: number) {
  await Seat.deleteMany({});
  const seats: Partial<SeatDoc>[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      seats.push({
        row: r,
        col: c,
        status: "AVAILABLE",
        heldBy: null,
        holdExpiresAt: null
      });
    }
  }

  await Seat.insertMany(seats);
  return Seat.find().lean();
}

export async function getAllSeats() {
  return Seat.find().lean();
}

export async function holdSeat(row: number, col: number, userId: string) {
  const now = new Date();
  const expiresAt = new Date(Date.now() + 60_000); // 60s

  const seat = await Seat.findOneAndUpdate(
    {
      row,
      col,
      $or: [
        { status: "AVAILABLE" },
        { status: "HELD", heldBy: userId }, // allow refreshing own hold
        { status: "HELD", holdExpiresAt: { $lt: now } } // expired holds
      ]
    },
    {
      $set: {
        status: "HELD",
        heldBy: userId,
        holdExpiresAt: expiresAt
      }
    },
    { new: true }
  ).lean();

  if (!seat) {
    throw new Error("Seat is already held or booked");
  }

  return seat;
}

export async function releaseExpiredHolds() {
  const now = new Date();
  const seats = await Seat.find({
    status: "HELD",
    holdExpiresAt: { $lt: now }
  });

  if (!seats.length) return [];

  const ids = seats.map(s => s._id);
  await Seat.updateMany(
    { _id: { $in: ids } },
    { $set: { status: "AVAILABLE", heldBy: null, holdExpiresAt: null } }
  );

  return Seat.find({ _id: { $in: ids } }).lean();
}

export async function bookSeats(seatIds: string[], userId: string) {
  const updatedSeats = [];

  for (const id of seatIds) {
    const seat = await Seat.findOneAndUpdate(
      {
        _id: id,
        status: "HELD",
        heldBy: userId,
        holdExpiresAt: { $gt: new Date() }
      },
      {
        $set: {
          status: "BOOKED",
          heldBy: null,
          holdExpiresAt: null
        }
      },
      { new: true }
    );

    if (!seat) {
      throw new Error("Seat booking conflict");
    }

    updatedSeats.push(seat);
  }

  return updatedSeats;
}
export async function getUserHeldSeats(userId: string) {
  return Seat.find({
    status: "HELD",
    heldBy: userId,
    holdExpiresAt: { $gt: new Date() }
  }).lean();
}
export async function releaseSeat(
  row: number,
  col: number,
  userId: string
) {
  const seat = await Seat.findOneAndUpdate(
    {
      row,
      col,
      status: "HELD",
      heldBy: userId
    },
    {
      $set: {
        status: "AVAILABLE",
        heldBy: null,
        holdExpiresAt: null
      }
    },
    { new: true }
  );

  if (!seat) {
    throw new Error("Seat not releasable");
  }

  return seat;
}
