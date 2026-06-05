import Medicine from "../models/Medicine.js";

// POST
export const addMedicine = async (req, res) => {
  try {
    const med = new Medicine(req.body);
    await med.save();
    res.status(201).json(med); // 201: Created
  } catch (error) {
    res.status(500).json({ error: "Failed to add medicine", details: error.message });
  }
};

// GET
export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch medicines", details: error.message });
  }
};

// PUT
export const updateMedicine = async (req, res) => {
  try {
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!updatedMedicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    res.json(updatedMedicine);
  } catch (error) {
    res.status(500).json({ error: "Failed to update medicine", details: error.message });
  }
};

// DELETE
export const deleteMedicine = async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!deletedMedicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete medicine", details: error.message });
  }
};