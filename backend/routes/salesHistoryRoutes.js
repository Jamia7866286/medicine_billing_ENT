import express from "express";
import {
  getAllHistory,
  getHistoryByDate,
  saveHistory,
  deleteHistoryByDate,
} from "../controllers/salesHistoryController.js";

const router = express.Router();

router.post("/", saveHistory);
router.get("/", getAllHistory);
router.get("/:date", getHistoryByDate);
router.delete("/:date", deleteHistoryByDate);

export default router;
