import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../apis/api";

interface BillItem {
  name: string;
  mrp: number;
  quantity: number;
  amount: number;
}

interface DailyHistory {
  _id?: string;
  date: string;
  items: BillItem[];
}

export const History = () => {
  const [history, setHistory] = useState<DailyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await API.get<DailyHistory[]>("/history");
        setHistory(response.data);
      } catch (err) {
        console.error("Failed to load history:", err);
        setError("Unable to load sales history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleDeleteDate = async (date: string) => {
    if (!window.confirm(`Are you sure you want to delete all records for ${date}? This cannot be undone.`)) {
      return;
    }

    setDeleting(date);
    try {
      await API.delete(`/history/${date}`);
      setHistory(history.filter((entry) => entry.date !== date));
    } catch (err) {
      console.error("Failed to delete history:", err);
      alert("Failed to delete history. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="pt-10">
      <div className="bg-white border-2 border-black p-6 rounded-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold border-b-4 border-black">
              Sales History
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Date-wise cleared invoices saved from billing.
            </p>
          </div>
          <Link
            to="/"
            className="bg-black text-white px-4 py-2 font-bold border-2 border-black"
          >
            Back to Billing
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-700">Loading history...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No sales history available yet.
          </div>
        ) : (
          <div className="space-y-8">
            {history.map((entry) => (
              <div key={entry._id ?? entry.date} className="border-2 border-black p-4 rounded-sm">
                <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <div className="text-lg font-bold">{entry.date}</div>
                    <div className="text-sm text-gray-600">{entry.items.length} invoice item(s)</div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-right text-xl font-black">
                      Total: {entry.items.reduce((sum, item) => sum + item.amount, 0)}
                    </div>
                    <button
                      onClick={() => handleDeleteDate(entry.date)}
                      disabled={deleting === entry.date}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 font-bold border-2 border-red-700 rounded-sm transition"
                    >
                      {deleting === entry.date ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-black bg-white">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border-2 border-black p-2">Medicine</th>
                        <th className="border-2 border-black p-2">Unit Price</th>
                        <th className="border-2 border-black p-2">Qty</th>
                        <th className="border-2 border-black p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.items.map((item, index) => (
                        <tr key={index} className="text-center hover:bg-gray-50">
                          <td className="border-2 border-black p-2">{item.name}</td>
                          <td className="border-2 border-black p-2">{item.mrp}</td>
                          <td className="border-2 border-black p-2">{item.quantity}</td>
                          <td className="border-2 border-black p-2">{item.amount.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
