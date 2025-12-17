
import { api } from "./axios";
import type { Seat } from "../context/Context";

export async function generateGridApi(
  rows: number,
  cols: number
): Promise<Seat[]> {
  const { data } = await api.post<Seat[]>("/generate", { rows, cols });
  return data;
}

export async function bookSeatsApi(
  seatIds: string[],
  userId: string
): Promise<{ success: boolean }> {
  const { data } = await api.post("/book", { seatIds, userId });
  return data;
}


export async function getSeatsApi(): Promise<Seat[]> {
  const { data } = await api.get<Seat[]>("/");
  return data;
}

export async function getHeldSeatsApi(
  userId: string
): Promise<Seat[]> {
  const { data } = await api.get<Seat[]>(`/held/${userId}`);
  return data;
}

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