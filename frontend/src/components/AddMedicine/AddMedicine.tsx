import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaFastBackward } from "react-icons/fa";
import API from "../../apis/api";
import { Link } from "react-router-dom";

interface Medicine {
  _id?: string;
  name: string;
  mrp: number;
}

const AddMedicineComponent = () => {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  // States for Adding New Medicine
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // States for Editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const fetchData = async () => {
    try {
      const response = await API.get<Medicine[]>("/medicines");
      setInventory(response.data);
    } catch (error) {
      console.error("Failed to load medicines:", error);
      alert(
        "Unable to load medicines. Please check the backend server and try again.",
      );
    }
  };

  useEffect(() => {
    const loadMedicines = async () => {
      await fetchData();
    };

    loadMedicines();
  }, []);

  // Function: Add Medicine to Master List (Inventory)
  const handleAddToInventory = async () => {
    if (!newName || !newPrice)
      return alert("Please enter medicine name and unit price.");
    const trimmedName = newName.trim();
    const price = parseFloat(newPrice);
    if (isNaN(price)) return alert("Please enter a valid unit price.");
    if (
      inventory.some(
        (item) => item.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      return alert("This medicine already exists in the list.");
    }

    const newItem: Medicine = { name: trimmedName, mrp: price };
    try {
      const response = await API.post<Medicine>("/medicines", newItem);
      setInventory((prev) => [...prev, response.data]);
      setNewName("");
      setNewPrice("");
    } catch (error) {
      console.error("Failed to add medicine:", error);
      alert("Could not add medicine. Please try again.");
    }
  };

  // Remove from Inventory
  const removeFromInventory = async (index: number) => {
    const item = inventory[index];
    if (!item) return;

    if (item._id) {
      try {
        await API.delete(`/medicines/${item._id}`);
      } catch (error) {
        console.error("Failed to delete medicine:", error);
        alert("Could not delete this medicine. Please try again.");
        return;
      }
    }

    setInventory((prev) => prev.filter((_, i) => i !== index));
  };

  // Start Editing
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditName(inventory[index].name);
    setEditPrice(inventory[index].mrp.toString());
  };

  // Save Edit
  const saveEdit = async () => {
    if (editingIndex === null || !editName || !editPrice)
      return alert("Please enter valid medicine details.");
    const trimmedName = editName.trim();
    const price = parseFloat(editPrice);
    if (isNaN(price)) return alert("Please enter a valid unit price.");
    if (
      inventory.some(
        (item, i) =>
          i !== editingIndex &&
          item.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      return alert("This medicine name is already used for another item.");
    }

    const item = inventory[editingIndex];

    if (item._id) {
      try {
        const response = await API.put<Medicine>(`/medicines/${item._id}`, {
          name: trimmedName,
          mrp: price,
        });

        setInventory((prev) => {
          const updated = [...prev];
          updated[editingIndex] = response.data;
          return updated;
        });
      } catch (error) {
        console.error("Failed to update medicine:", error);
        alert("Could not update this medicine. Please try again.");
        return;
      }
    } else {
      const updated = [...inventory];
      updated[editingIndex] = { name: trimmedName, mrp: price };
      setInventory(updated);
    }

    setEditingIndex(null);
    setEditName("");
    setEditPrice("");
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditName("");
    setEditPrice("");
  };

  return (
    <div className="app-shell">
      <div className="card-shell overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-100">
                Inventory manager
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Medicine catalog</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/85">
                Add or edit medicines for billing. Keep your catalog up to date with fast search and modern controls.
              </p>
            </div>
            <Link to="/" className="btn-secondary px-5 py-3 text-sm">
              <FaFastBackward />
              Back
            </Link>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-8 space-y-8">
          <div className="grid grid-cols-2 gap-3 items-end bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Medicine Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Unit price</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="input-field"
              />
            </div>
            <button
              onClick={handleAddToInventory}
              className="btn-primary w-full px-5 py-3 text-sm col-span-2 sm:col-span-1"
            >
              Add Medicine
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Unit Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, i) =>
                  editingIndex === i ? (
                    <tr key={i} className="bg-slate-50">
                      <td>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="input-field"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="input-field"
                        />
                      </td>
                      <td className="flex flex-wrap gap-3">
                        <button onClick={saveEdit} className="btn-primary px-4 py-2 text-sm">
                          Save
                        </button>
                        <button onClick={cancelEdit} className="btn-secondary px-4 py-2 text-sm">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} className="text-slate-700">
                      <td>{item.name}</td>
                      <td>{item.mrp}</td>
                      <td className="flex flex-wrap gap-2">
                        <button onClick={() => startEditing(i)} className="btn-secondary btn-icon h-11 w-11">
                          <FaEdit />
                        </button>
                        <button onClick={() => removeFromInventory(i)} className="btn-secondary btn-icon h-11 w-11">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineComponent;
