import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
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
    <div className="app-shell">
      <div className="card-shell overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">
                Sales dashboard
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                Modern Medicine Billing
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-100/85">
                Add medicines, create invoices and save daily sales history all from one polished dashboard.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/add-medicine" className="btn-secondary px-5 py-3 text-sm">
                Medicines
              </Link>
              <Link to="/history" className="btn-primary px-5 py-3 text-sm">
                History
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
            <div className="card-compact p-6">
              <div className="grid gap-4 sm:grid-cols-[1.8fr_0.8fr]">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Medicine</label>
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
                    className="input-field"
                  />
                  {showMedSuggestions && (
                    <div className="relative">
                      <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                        {filteredMedOptions.length > 0 ? (
                          filteredMedOptions.map(({ item, index }) => (
                            <button
                              type="button"
                              key={index}
                              onMouseDown={() => {
                                setSelectedMedIndex(index.toString());
                                setSelectedMedQuery(item.name);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-slate-800 hover:bg-slate-50"
                            >
                              {item.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500">No matches found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Quantity</label>
                  <select value={qty} onChange={(e) => setQty(e.target.value)} className="input-field">
                    <option value="">Select qty</option>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button onClick={handleAddToBill} className="btn-primary px-6 py-3 text-sm">
                  <span className="hidden sm:inline">Add to Invoice</span>
                  <span className="sm:hidden">Add</span>
                </button>
                <button onClick={handleClearInvoice} className="btn-secondary px-6 py-3 text-sm">
                  <span className="hidden sm:inline">Clear all</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              </div>
            </div>

            <div className="card-compact p-6 bg-slate-50">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Invoice total</p>
              <div className="mt-6 text-5xl font-semibold text-slate-950">{Math.round(grandTotal)}</div>
              <p className="mt-3 text-sm text-slate-600">Grand total for the current invoice. Add or edit items before clearing.</p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>
                    <span className="hidden sm:inline">Medicine Name</span>
                    <span className="sm:hidden">Name</span>
                  </th>
                  <th>
                    <span className="hidden sm:inline">Unit Price</span>
                    <span className="sm:hidden">Price</span>
                  </th>
                  <th>
                    <span className="hidden sm:inline">Qty</span>
                    <span className="sm:hidden">Qty</span>
                  </th>
                  <th>
                    <span className="hidden sm:inline">Amount</span>
                    <span className="sm:hidden">Amt</span>
                  </th>
                  <th>
                    <span className="hidden sm:inline">Actions</span>
                    <span className="sm:hidden">Act</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item, i) =>
                  editingBillIndex === i ? (
                    <tr key={i} className="bg-slate-50">
                      <td>
                        <input type="text" value={item.name} className="input-field" disabled />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editBillMrp}
                          onChange={(e) => setEditBillMrp(e.target.value)}
                          className="input-field"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={editBillQty}
                          onChange={(e) => setEditBillQty(e.target.value)}
                          className="input-field"
                        />
                      </td>
                      <td className="font-semibold text-slate-900">{item.amount}</td>
                      <td className="space-x-2">
                        <button onClick={saveBillEdit} className="btn-primary px-4 py-2 text-xs">Save</button>
                        <button onClick={cancelBillEdit} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} className="text-slate-700">
                      <td>{item.name}</td>
                      <td>{item.mrp}</td>
                      <td>{item.quantity}</td>
                      <td className="font-semibold text-slate-900">{item.amount.toFixed(1)}</td>
                      <td className="flex flex-wrap items-center gap-2">
                        <button onClick={() => startBillEditing(i)} className="btn-secondary btn-icon h-11 w-11">
                          <FaEdit />
                        </button>
                        <button onClick={() => removeBillItem(i)} className="btn-secondary btn-icon h-11 w-11">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ),
                )}
                {billItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                      No invoice items yet. Add a medicine to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineBillingComponent;
