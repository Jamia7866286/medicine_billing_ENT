import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import data from "./assets/data/medInventory.json";

interface Medicine {
  name: string;
  price: number;
}

interface BillItem {
  name: string;
  mrp: number;
  quantity: number;
  amount: number;
}

const SALES_HISTORY_KEY = "daily_sales_history";

const getTodayKey = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const loadSalesHistory = (): Record<string, BillItem[]> => {
  const saved = localStorage.getItem(SALES_HISTORY_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
};

const saveSalesHistory = (history: Record<string, BillItem[]>) => {
  localStorage.setItem(SALES_HISTORY_KEY, JSON.stringify(history));
};

const MedicalBillingApp = () => {
  // LocalStorage se Inventory load karna
  // const [inventory, setInventory] = useState<Medicine[]>(() => {
  //   const saved = localStorage.getItem("med_inventory");
  //   return saved ? JSON.parse(saved) : [];
  // });

   const [inventory, setInventory] = useState<Medicine[]>(data);

  // States for Billing
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedMedIndex, setSelectedMedIndex] = useState("");
  const [selectedMedQuery, setSelectedMedQuery] = useState("");
  const [showMedSuggestions, setShowMedSuggestions] = useState(false);
  const [qty, setQty] = useState("");
  const [salesHistory, setSalesHistory] = useState<Record<string, BillItem[]>>(
    () => loadSalesHistory(),
  );

  // States for Adding New Medicine
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // States for Editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // States for Editing Bill Items
  const [editingBillIndex, setEditingBillIndex] = useState<number | null>(null);
  const [editBillQty, setEditBillQty] = useState("");
  const [editBillMrp, setEditBillMrp] = useState("");

  // Save to LocalStorage whenever inventory changes
  // useEffect(() => {
  //   localStorage.setItem("med_inventory", JSON.stringify(inventory));
  // }, [inventory]);

  const syncTodayHistory = (items: BillItem[]) => {
    const todayKey = getTodayKey();
    const nextHistory = {
      ...salesHistory,
      [todayKey]: items,
    };
    saveSalesHistory(nextHistory);
    setSalesHistory(nextHistory);
  };

  // Function: Add Medicine to Master List (Inventory)
  const handleAddToInventory = () => {
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

    const newItem: Medicine = { name: trimmedName, price };
    setInventory([...inventory, newItem]);
    setNewName("");
    setNewPrice("");
  };

  // Function: Add selected medicine to Current Bill
  const handleAddToBill = () => {
    if (selectedMedIndex === "" || !qty || parseInt(qty) <= 0)
      return alert("Please select a medicine and quantity.");

    const med = inventory[parseInt(selectedMedIndex)];
    if (billItems.some((item) => item.name === med.name)) {
      return alert(
        "This medicine is already in the invoice. Edit the item to change quantity.",
      );
    }

    const quantity = parseInt(qty);
    const newItem: BillItem = {
      name: med.name,
      mrp: med.price,
      quantity,
      amount: med.price * quantity,
    };

    const nextItems = [...billItems, newItem];
    setBillItems(nextItems);
    setSelectedMedIndex("");
    setSelectedMedQuery("");
    setShowMedSuggestions(false);
    setQty("");
    syncTodayHistory(nextItems);
  };

  const handleClearInvoice = () => {
    if (billItems.length === 0) {
      return alert("No items to clear.");
    }
    // Save current bill to history before clearing
    syncTodayHistory(billItems);
    setBillItems([]);
    setSelectedMedIndex("");
    setSelectedMedQuery("");
    setShowMedSuggestions(false);
    setQty("");
  };

  // Calculate Grand Total
  const grandTotal = billItems.reduce((sum, item) => sum + item.amount, 0);

  const filteredMedOptions = inventory
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      selectedMedQuery.trim()
        ? item.name.toLowerCase().includes(selectedMedQuery.toLowerCase())
        : true,
    );

  // Remove from Inventory
  const removeFromInventory = (index: number) => {
    const updated = inventory.filter((_, i) => i !== index);
    setInventory(updated);
  };

  // Start Editing
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditName(inventory[index].name);
    setEditPrice(inventory[index].price.toString());
  };

  // Save Edit
  const saveEdit = () => {
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

    const updated = [...inventory];
    updated[editingIndex] = { name: trimmedName, price };
    setInventory(updated);
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

  const startBillEditing = (index: number) => {
    setEditingBillIndex(index);
    setEditBillQty(billItems[index].quantity.toString());
    setEditBillMrp(billItems[index].mrp.toString());
  };

  const saveBillEdit = () => {
    if (
      editingBillIndex === null ||
      !editBillQty ||
      parseInt(editBillQty) <= 0 ||
      !editBillMrp
    ) {
      return alert("Please enter valid quantity and unit price.");
    }

    const quantity = parseInt(editBillQty);
    const mrp = parseFloat(editBillMrp);
    if (isNaN(mrp)) return alert("Please enter a valid unit price.");

    const updated = [...billItems];
    updated[editingBillIndex] = {
      ...updated[editingBillIndex],
      quantity,
      mrp,
      amount: quantity * mrp,
    };

    setBillItems(updated);
    syncTodayHistory(updated);
    setEditingBillIndex(null);
    setEditBillQty("");
    setEditBillMrp("");
  };

  const cancelBillEdit = () => {
    setEditingBillIndex(null);
    setEditBillQty("");
    setEditBillMrp("");
  };

  const removeBillItem = (index: number) => {
    const updated = billItems.filter((_, i) => i !== index);
    setBillItems(updated);
    syncTodayHistory(updated);
    if (editingBillIndex !== null) {
      setEditingBillIndex(null);
      setEditBillQty("");
      setEditBillMrp("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* --- SECTION 1: BILLING TABLE --- */}
        <div className="bg-[#e8f5e9] border-2 border-black p-6 rounded-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold border-b-4 border-black">
              1. Medicine Billing
            </h2>
            {/* <button
              onClick={handleClearInvoice}
              className="bg-white border-2 border-black px-4 py-1 font-black text-xl hover:bg-gray-100"
            >
              Clear Invoice
            </button> */}
          </div>

          {/* Input Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
            <div className="flex flex-col relative">
              <label className="font-bold text-sm">Choose medicine</label>
              <input
                type="text"
                value={selectedMedQuery}
                onChange={(e) => {
                  setSelectedMedQuery(e.target.value);
                  setSelectedMedIndex("");
                  setShowMedSuggestions(true);
                }}
                onFocus={() => setShowMedSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowMedSuggestions(false), 150)
                }
                placeholder="Search medicine"
                className="border-2 border-black p-2 bg-white"
              />
              {showMedSuggestions && (
                <div className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-sm border border-black bg-white shadow-lg">
                  {filteredMedOptions.length > 0 ? (
                    filteredMedOptions.map(({ item, index }) => (
                      <button
                        type="button"
                        key={index}
                        onMouseDown={() => {
                          setSelectedMedIndex(index.toString());
                          setSelectedMedQuery(item.name);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        {item.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No matches found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-sm">Quantity</label>
              <select
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="border-2 border-black p-2"
              >
                <option value="">-- Select --</option>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddToBill}
              className="bg-black text-white p-2 font-bold hover:bg-gray-800 transition-all cursor-pointer"
            >
              Add to Invoice
            </button>
            <button
              onClick={handleClearInvoice}
              className="bg-red-500 border-2 px-4 py-1 font-bold text-white text-xl cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Bill Table */}
          <table className="w-full border-collapse border-2 border-black bg-white">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-black p-2">Medicine Name</th>
                <th className="border-2 border-black p-2">Unit Price</th>
                <th className="border-2 border-black p-2">Qty</th>
                <th className="border-2 border-black p-2">Amount</th>
                <th className="border-2 border-black p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, i) =>
                editingBillIndex === i ? (
                  <tr key={i} className="bg-yellow-50">
                    <td className="border-2 border-black p-2 font-bold">
                      {item.name}
                    </td>
                    <td className="border-2 border-black p-2">
                      <input
                        type="number"
                        value={editBillMrp}
                        onChange={(e) => setEditBillMrp(e.target.value)}
                        className="border border-gray-400 p-1 w-full"
                      />
                    </td>
                    <td className="border-2 border-black p-2">
                      <input
                        type="number"
                        min="1"
                        value={editBillQty}
                        onChange={(e) => setEditBillQty(e.target.value)}
                        className="border border-gray-400 p-1 w-full"
                      />
                    </td>
                    <td className="border-2 border-black p-2 font-bold">
                      {item.amount}
                    </td>
                    <td className="border-2 border-black p-2 space-x-2">
                      <button
                        onClick={saveBillEdit}
                        className="text-green-600 font-bold underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelBillEdit}
                        className="text-gray-600 font-bold underline"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={i}
                    className="text-center font-mono hover:bg-gray-50"
                  >
                    <td className="border-2 border-black p-2">{item.name}</td>
                    <td className="border-2 border-black p-2">{item.mrp}</td>
                    <td className="border-2 border-black p-2">
                      {item.quantity}
                    </td>
                    <td className="border-2 border-black p-2 font-bold">
                      {item.amount.toFixed(1)}
                    </td>
                    <td className="border-2 border-black p-2 space-x-2">
                      <button onClick={() => startBillEditing(i)}>
                        <FaEdit
                          style={{ cursor: "pointer", marginRight: "10px" }}
                          className="text-blue-600 cursor-pointer"
                        />
                      </button>
                      <button onClick={() => removeBillItem(i)}>
                        <FaTrash
                          style={{ cursor: "pointer" }}
                          className="text-red-600 font-bold underline cursor-pointer"
                        />
                      </button>
                    </td>
                  </tr>
                ),
              )}
              {billItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-gray-500 italic"
                  >
                    No medicines in invoice yet. Add items above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4 text-right text-2xl font-black">
            Grand Total:{" "}
            <span className="bg-yellow-300 px-4 border-2 border-black">
              {Math.round(grandTotal)}
            </span>
          </div>
        </div>

        {/* --- SECTION 2: ADD MEDICINE (INVENTORY) --- */}
        <div className="bg-white border-2 border-black p-6 rounded-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-bold mb-6 border-b-4 border-black inline-block">
            2. Medicine List
          </h2>

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
                    <td className="border-2 border-black p-2">{item.price}</td>
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
    </div>
  );
};

export default MedicalBillingApp;
