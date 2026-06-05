import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import API from "../../apis/api";
import { Link } from "react-router-dom";

interface Medicine {
  name: string;
  mrp: number;
}

interface BillItem {
  name: string;
  mrp: number;
  quantity: number;
  amount: number;
}

const CURRENT_BILL_KEY = "current_bill";

const getTodayKey = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const getCurrentBillKey = () => `${CURRENT_BILL_KEY}_${getTodayKey()}`;

const loadCurrentBill = (): BillItem[] => {
  const saved = localStorage.getItem(getCurrentBillKey());
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

const saveCurrentBill = (items: BillItem[]) => {
  localStorage.setItem(getCurrentBillKey(), JSON.stringify(items));
};

const clearCurrentBill = () => {
  localStorage.removeItem(getCurrentBillKey());
};

const saveHistoryToServer = async (items: BillItem[]) => {
  await API.post("/history", {
    date: getTodayKey(),
    items,
  });
};

const MedicineBillingComponent = () => {
  const [inventory, setInventory] = useState<Medicine[]>([]);

  // States for Billing
  const [billItems, setBillItems] = useState<BillItem[]>(loadCurrentBill());
  const [selectedMedIndex, setSelectedMedIndex] = useState("");
  const [selectedMedQuery, setSelectedMedQuery] = useState("");
  const [showMedSuggestions, setShowMedSuggestions] = useState(false);
  const [qty, setQty] = useState("");

  // States for Editing Bill Items
  const [editingBillIndex, setEditingBillIndex] = useState<number | null>(null);
  const [editBillQty, setEditBillQty] = useState("");
  const [editBillMrp, setEditBillMrp] = useState("");

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
      mrp: med.mrp,
      quantity,
      amount: med.mrp * quantity,
    };

    const nextItems = [...billItems, newItem];
    setBillItems(nextItems);
    setSelectedMedIndex("");
    setSelectedMedQuery("");
    setShowMedSuggestions(false);
    setQty("");
  };

  const handleClearInvoice = async () => {
    if (billItems.length === 0) {
      return alert("No items to clear.");
    }

    try {
      await saveHistoryToServer(billItems);
    } catch (error) {
      console.error("Failed to save invoice history:", error);
      return alert("Could not save cleared invoice history. Please try again.");
    }

    setBillItems([]);
    clearCurrentBill();
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
    if (editingBillIndex !== null) {
      setEditingBillIndex(null);
      setEditBillQty("");
      setEditBillMrp("");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/medicines");
        setInventory(res.data);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        alert("Failed to load medicines. Please try again later.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    saveCurrentBill(billItems);
  }, [billItems]);

  return (
    <div className="pt-10">
      {/* --- SECTION 1: BILLING TABLE --- */}
      <div className="bg-[#e8f5e9] border-2 border-black p-6 rounded-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold border-b-4 border-black">
            Medicine Billing
          </h2>
          <div className="flex gap-2">
            <Link
              to="/history"
              className="bg-blue-500 border-2 border-black px-4 py-1 font-black text-white text-md"
            >
              History
            </Link>
            <Link
              to="/add-medicine"
              className="bg-red-500 border-2 border-black px-4 py-1 font-black text-white text-md"
            >
              Medicines
              <FaPlus style={{ display: "inline", marginLeft: "8px" }} />
            </Link>
          </div>
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
              onBlur={() => setTimeout(() => setShowMedSuggestions(false), 150)}
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
                <tr key={i} className="text-center font-mono hover:bg-gray-50">
                  <td className="border-2 border-black p-2">{item.name}</td>
                  <td className="border-2 border-black p-2">{item.mrp}</td>
                  <td className="border-2 border-black p-2">{item.quantity}</td>
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
    </div>
  );
};

export default MedicineBillingComponent;
