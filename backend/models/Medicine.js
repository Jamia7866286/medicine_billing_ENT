import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: String,
  mrp: Number,
}, { timestamps: true });

export default mongoose.model("Medicine", medicineSchema);