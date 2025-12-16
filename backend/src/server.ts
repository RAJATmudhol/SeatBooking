import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {seatRoutes} from "./route/seatRoutes";
import { releaseExpiredHolds } from "./modules/seatService";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});



// 🔌 Socket.IO
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// 🌍 Routes
app.get("/", (_req, res) => {
  res.send("✅ Seat booking server running");
});

app.use("/api/seats", seatRoutes(io)); 

// 🗄 MongoDB
const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI missing in .env");
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    setInterval(async () => {
      try {
        const expired = await releaseExpiredHolds();
        expired.forEach((seat: any) => {
          io.emit("seat:released", seat);
        });
      } catch (err) {
        console.error("⏱ Release expired holds failed:", err);
      }
    }, 5000);
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
