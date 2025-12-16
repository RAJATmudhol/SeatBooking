// // src/models/Seat.ts
// import { Schema, model } from "mongoose";

// export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";

// const SeatSchema = new Schema(
//   {
//     row: { type: Number, required: true },
//     col: { type: Number, required: true },

//     status: {
//       type: String,
//       enum: ["AVAILABLE", "HELD", "BOOKED"],
//       required: true
//     },

//     heldBy: { type: String, default: null }, // userId
//     holdExpiresAt: { type: Date, default: null }
//   },
//   { timestamps: true }
// );

// // Prevent duplicates
// SeatSchema.index({ row: 1, col: 1 }, { unique: true });

// export const Seat = model("Seat", SeatSchema);

// src/models/Seat.ts
import { Schema, model, Document } from "mongoose";

export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";

export interface SeatDoc extends Document {
  row: number;
  col: number;
  status: SeatStatus;
  heldBy: string | null;
  holdExpiresAt: Date | null;
}

const SeatSchema = new Schema<SeatDoc>(
  {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "HELD", "BOOKED"],
      required: true,
      default: "AVAILABLE"
    },
    heldBy: { type: String, default: null },
    holdExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// prevent duplicates
SeatSchema.index({ row: 1, col: 1 }, { unique: true });

export const Seat = model<SeatDoc>("Seat", SeatSchema);