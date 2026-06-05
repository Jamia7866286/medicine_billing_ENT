import SalesHistory from "../models/SalesHistory.js";

export const getAllHistory = async (req, res) => {
  try {
    const history = await SalesHistory.find().sort({ date: -1 });
    return res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales history", details: error.message });
  }
};

export const getHistoryByDate = async (req, res) => {
  try {
    const history = await SalesHistory.findOne({ date: req.params.date });
    return res.json(history || { date: req.params.date, items: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales history", details: error.message });
  }
};

export const saveHistory = async (req, res) => {
  const { date, items } = req.body;

  if (!date || !Array.isArray(items)) {
    return res.status(400).json({ error: "Date and items are required" });
  }

  try {
    const history = await SalesHistory.findOneAndUpdate(
      { date },
      { $push: { items: { $each: items } } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to save sales history", details: error.message });
  }
};

export const deleteHistoryByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const result = await SalesHistory.deleteOne({ date });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No history found for this date" });
    }

    res.json({ message: "History deleted successfully", date });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete sales history", details: error.message });
  }
};
