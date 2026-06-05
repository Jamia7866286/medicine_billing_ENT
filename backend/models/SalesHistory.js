import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    name: String,
    mrp: Number,
    quantity: Number,
    amount: Number,
  },
  { _id: false },
);

const salesHistorySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    items: [saleItemSchema],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SalesHistory", salesHistorySchema);
