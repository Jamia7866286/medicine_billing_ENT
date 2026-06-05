import express from "express";
import {
  addMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicineController.js";

const router = express.Router();

router.post("/", addMedicine);
router.get("/", getMedicines);
router.put("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);

export default router;