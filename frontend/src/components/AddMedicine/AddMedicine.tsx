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
    <div className="pt-10">
      <div className="bg-[#e8f5e9] border-2 border-black p-6 rounded-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold border-b-4 border-black">
            All Medicine
          </h2>
          <Link
            to="/"
             className="bg-red-500 border-2 border-black px-4 py-1 font-black text-white text-md"
          >
            <FaFastBackward style={{ display: "inline", marginRight: "8px" }} />
            Back
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 items-end bg-gray-50 p-4 border-2 border-dashed border-black">
          <div className="flex flex-col">
            <label className="font-bold text-sm">Medicine Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border-2 border-black p-2 w-48"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-bold text-sm">Unit price</label>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="border-2 border-black p-2 w-24"
            />
          </div>
          <button
            onClick={handleAddToInventory}
            className="border-2 border-black px-6 py-2 font-bold bg-white hover:bg-black hover:text-white transition-all"
          >
            Add Medicine
          </button>
        </div>

        <table className="w-full border-collapse border-2 border-black">
          <thead className="bg-black text-white">
            <tr>
              <th className="border-2 border-black p-2">Medicine Name</th>
              <th className="border-2 border-black p-2">Unit price</th>
              <th className="border-2 border-black p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, i) =>
              editingIndex === i ? (
                // Edit Mode Row
                <tr key={i} className="bg-yellow-50">
                  <td className="border-2 border-black p-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border border-gray-400 p-1 w-full"
                    />
                  </td>
                  <td className="border-2 border-black p-2">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="border border-gray-400 p-1 w-full"
                    />
                  </td>
                  <td className="border-2 border-black p-2 space-x-2">
                    <button
                      onClick={saveEdit}
                      className="text-green-600 font-bold underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-600 font-bold underline"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                // Normal Row
                <tr key={i} className="text-center hover:bg-gray-50">
                  <td className="border-2 border-black p-2 font-bold">
                    {item.name}
                  </td>
                  <td className="border-2 border-black p-2">{item.mrp}</td>
                  <td className="border-2 border-black p-2 space-x-2">
                    <button
                      onClick={() => startEditing(i)}
                      className="text-blue-600 font-bold underline"
                    >
                      <FaEdit
                        style={{ cursor: "pointer", marginRight: "10px" }}
                        className="text-blue-600 cursor-pointer"
                      />
                    </button>
                    <button onClick={() => removeFromInventory(i)}>
                      <FaTrash
                        style={{ cursor: "pointer" }}
                        className="text-red-600 font-bold underline cursor-pointer"
                      />
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddMedicineComponent;
