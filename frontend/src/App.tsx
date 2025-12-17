
import { useState } from "react";
import { SeatProvider, useSeatContext } from "../src/context/Context";
import "./App.css";

function SeatApp() {
  const {
    seats,
    selected,
    userId,
    cols,
    setGrid,
    toggleSelect,
    bookSelected
  } = useSeatContext();

  const [inputRows, setInputRows] = useState(5);
  const [inputCols, setInputCols] = useState(8);

  async function handleGenerate() {
    if (
      inputRows < 3 ||
      inputRows > 20 ||
      inputCols < 3 ||
      inputCols > 20
    ) {
      alert("Rows & Columns must be between 3 and 20");
      return;
    }
    await setGrid(inputRows, inputCols);
  }

  function getSeatClass(seat: any) {
    if (seat.status === "BOOKED") return "seat-btn seat-booked";

    if (seat.status === "HELD") {
      if (seat.heldBy === userId) return "seat-btn seat-selected"; 
      return "seat-btn seat-locked"; 
    }

    const isSelected = selected.some((s: any) => s._id === seat._id);
    if (isSelected) return "seat-btn seat-selected";

    return "seat-btn seat-available";
  }

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <h1 className="app-title">Seat Grid Generator</h1>

        <div className="controls">
          <input
            type="number"
            min={3}
            max={20}
            value={inputRows}
            onChange={e => setInputRows(Number(e.target.value))}
            className="input-box"
          />
          <input
            type="number"
            min={3}
            max={20}
            value={inputCols}
            onChange={e => setInputCols(Number(e.target.value))}
            className="input-box"
          />
          <button onClick={handleGenerate} className="btn btn-generate">
            Generate
          </button>
        </div>

        <button onClick={bookSelected} className="btn btn-send">
          Book Selected Seats
        </button>

        {seats.length > 0 ? (
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
          >
            {seats.map(seat => (
              <button
                key={seat._id}
                onClick={() => toggleSelect(seat)}
                className={getSeatClass(seat)}
                disabled={
                  seat.status === "BOOKED" ||
                  (seat.status === "HELD" && seat.heldBy !== userId)
                }
              >
                {seat.row + 1}-{seat.col + 1}
              </button>
            ))}
          </div>
        ) : (
          <p className="placeholder">
            Enter rows & columns, then click Generate
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SeatProvider>
      <SeatApp />
    </SeatProvider>
  );
}