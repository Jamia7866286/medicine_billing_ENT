import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import salesHistoryRoutes from "./routes/salesHistoryRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/medicines", medicineRoutes);
app.use("/api/history", salesHistoryRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(5000, () => console.log("Server running on 5000 🚀"));