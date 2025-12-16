// src/context/SeatContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { io, } from "socket.io-client";
import {
  getSeatsApi,
  getHeldSeatsApi,
  holdSeatApi,
  bookSeatsApi,
  generateGridApi,
  releaseSeatApi
} from "../api/Seatapi";

export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";

export interface Seat {
  _id: string;
  row: number;
  col: number;
  status: SeatStatus;
  heldBy: string | null;
  holdExpiresAt: string | null;
}

interface SeatContextType {
  seats: Seat[];
  selected: Seat[];
  userId: string;
  rows: number;
  cols: number;
  setGrid(rows: number, cols: number): Promise<void>;
  toggleSelect(seat: Seat): Promise<void>;
  clearSelection(): void;
  bookSelected(): Promise<void>;
}

const SeatContext = createContext<SeatContextType | null>(null);

export function SeatProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<Seat[]>([]);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  // const [socket, setSocket] = useState<Socket | null>(null);

  const [userId] = useState(
    () => localStorage.getItem("userId") ?? crypto.randomUUID()
  );

  // Persist userId
  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  // Socket connection + listeners
  useEffect(():any => {
    const s = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
  });


    s.on("seats:init", (seatsFromServer: Seat[]) => {
      setSeats(seatsFromServer);
      inferGridDimensions(seatsFromServer);
    });

    s.on("seat:locked", (seat: Seat) => {
      setSeats(prev =>
        prev.map(x => (x._id === seat._id ? seat : x))
      );
    });

    s.on("seat:released", (seat: Seat) => {
      setSeats(prev =>
        prev.map(x => (x._id === seat._id ? seat : x))
      );
    });

    s.on("seat:booked", (seat: Seat) => {
      setSeats(prev =>
        prev.map(x => (x._id === seat._id ? seat : x))
      );
    });
      //setSelected(prev => prev.filter(s => s._id !== seat._id));
  

    // setSocket(s);
    return () => s.disconnect();
  }, []);

  // Initial load + recovery
  useEffect(() => {
    (async () => {
      const allSeats = await getSeatsApi();
      if (allSeats.length) {
        setSeats(allSeats);
        inferGridDimensions(allSeats);
      }

      const heldByMe = await getHeldSeatsApi(userId);
      if (heldByMe.length) {
        setSelected(heldByMe);
      }
    })();
  }, [userId]);

  function inferGridDimensions(seats: Seat[]) {
    if (!seats.length) return;
    const maxRow = Math.max(...seats.map(s => s.row));
    const maxCol = Math.max(...seats.map(s => s.col));
    setRows(maxRow + 1);
    setCols(maxCol + 1);
  }

  async function setGrid(r: number, c: number) {
    const newSeats = await generateGridApi(r, c);
    setSeats(newSeats);
    setSelected([]);
    setRows(r);
    setCols(c);
  }

async function toggleSelect(seat: Seat) {
  // ❌ booked seat
  if (seat.status === "BOOKED") return;

  // ❌ held by someone else
  if (seat.status === "HELD" && seat.heldBy !== userId) return;

  const alreadySelected = selected.some(s => s._id === seat._id);

  // 🔓 UN-HOLD (release)
  if (alreadySelected && seat.heldBy === userId) {
    const released = await releaseSeatApi(seat.row, seat.col, userId);

    setSeats(prev =>
      prev.map(s => (s._id === released._id ? released : s))
    );

    setSelected(prev => prev.filter(s => s._id !== released._id));
    return;
  }

  // 🔒 HOLD
  const held = await holdSeatApi(seat.row, seat.col, userId);

  setSeats(prev =>
    prev.map(s => (s._id === held._id ? held : s))
  );

  setSelected(prev => [...prev, held]);
}



  function clearSelection() {
    setSelected([]);
  }

  function isContiguous(seatsToCheck: Seat[]) {
    if (seatsToCheck.length <= 1) return true;

    const row = seatsToCheck[0].row;
    if (!seatsToCheck.every(s => s.row === row)) return false;

    const sorted = [...seatsToCheck].sort((a, b) => a.col - b.col);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].col !== sorted[i - 1].col + 1) return false;
    }
    return true;
  }

 
async function bookSelected() {
  if (!selected.length) {
    alert("No seats selected");
    return;
  }

  if (!isContiguous(selected)) {
    alert("Seats must be contiguous");
    return;
  }

  const seatIds = selected.map(s => s._id);

  try {
    await bookSeatsApi(seatIds, userId);

    // OPTIMISTIC UI UPDATE
    setSeats(prev =>
      prev.map(seat =>
        seatIds.includes(seat._id)
          ? { ...seat, status: "BOOKED", heldBy: null }
          : seat
      )
    );

    setSelected([]);
  } catch (err) {
    alert("Booking failed");
  }
}

  const value: SeatContextType = {
    seats,
    selected,
    userId,
    rows,
    cols,
    setGrid,
    toggleSelect,
    clearSelection,
    bookSelected
  };

  return (
    <SeatContext.Provider value={value}>
      {children}
    </SeatContext.Provider>
  );
}

export function useSeatContext(): SeatContextType {
  const ctx = useContext(SeatContext);
  if (!ctx) throw new Error("SeatContext missing");
  return ctx;
}