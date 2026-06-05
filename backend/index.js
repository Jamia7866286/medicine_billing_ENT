import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import salesHistoryRoutes from "./routes/salesHistoryRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use("/api/medicines", medicineRoutes);
app.use("/api/history", salesHistoryRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(PORT, () => console.log(`Server running on ${PORT} 🚀`));