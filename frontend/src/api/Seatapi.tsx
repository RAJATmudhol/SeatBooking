// // src/api/seats.ts
// const BASE_URL = "http://localhost:4000/api/seats";

// export async function generateGridApi(
//   rows: number,
//   cols: number
// ): Promise<any[]> {
//   const res = await fetch(`${BASE_URL}/generate`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ rows, cols })
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export async function bookSeatsApi(seatIds: string[], userId: string) {
//   const res = await fetch(`${BASE_URL}/book`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ seatIds, userId })
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export async function getSeatsApi() {
//   const res = await fetch(`${BASE_URL}`);
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export async function getHeldSeatsApi(userId: string) {
//   const res = await fetch(`${BASE_URL}/held/${userId}`);
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export async function holdSeatApi(
//   row: number,
//   col: number,
//   userId: string
// ): Promise<any> {
//   const res = await fetch(`${BASE_URL}/hold`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ row, col, userId })
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

import { api } from "./axios";
import type { Seat } from "../context/Context";

/**
 * Generate grid
 */
export async function generateGridApi(
  rows: number,
  cols: number
): Promise<Seat[]> {
  const { data } = await api.post<Seat[]>("/generate", { rows, cols });
  return data;
}

/**
 * Book seats
 */
export async function bookSeatsApi(
  seatIds: string[],
  userId: string
): Promise<{ success: boolean }> {
  const { data } = await api.post("/book", { seatIds, userId });
  return data;
}

/**
 * Get all seats
 */
export async function getSeatsApi(): Promise<Seat[]> {
  const { data } = await api.get<Seat[]>("/");
  return data;
}

/**
 * Get held seats (state recovery)
 */
export async function getHeldSeatsApi(
  userId: string
): Promise<Seat[]> {
  const { data } = await api.get<Seat[]>(`/held/${userId}`);
  return data;
}

/**
 * Hold seat
 */
export async function holdSeatApi(
  row: number,
  col: number,
  userId: string
): Promise<Seat> {
  const { data } = await api.post<Seat>("/hold", {
    row,
    col,
    userId
  });
  return data;
}

export async function releaseSeatApi(
  row: number,
  col: number,
  userId: string
): Promise<Seat> {
  const { data } = await api.post<Seat>("/release", {
    row,
    col,
    userId
  });
  return data;
}