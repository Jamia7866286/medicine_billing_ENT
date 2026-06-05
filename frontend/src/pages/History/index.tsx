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
    <div className="app-shell">
      <div className="card-shell overflow-hidden">
        <div className="bg-gradient-to-r from-violet-700 to-fuchsia-600 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-100">
                Daily sales history
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Sales records</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100/85">
                Review every day’s cleared invoices and remove old records with a single tap.
              </p>
            </div>
            <Link to="/" className="btn-secondary px-5 py-3 text-sm">
              Back to Billing
            </Link>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="text-center py-10 text-slate-700">Loading history...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No sales history available yet.</div>
          ) : (
            <div className="space-y-6">
              {history.map((entry) => (
                <div key={entry._id ?? entry.date} className="card-compact overflow-hidden border border-slate-200 bg-white p-6">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{entry.date}</div>
                      <div className="mt-1 text-sm text-slate-500">{entry.items.length} invoice item(s)</div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="text-right text-2xl font-semibold text-slate-900">
                        Total: {entry.items.reduce((sum, item) => sum + item.amount, 0)}
                      </div>
                      <button
                        onClick={() => handleDeleteDate(entry.date)}
                        disabled={deleting === entry.date}
                        className="btn-primary px-4 py-3 text-sm"
                      >
                        {deleting === entry.date ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-3xl border border-slate-200">
                    <table className="table-modern">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Unit Price</th>
                          <th>Qty</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.items.map((item, index) => (
                          <tr key={index} className="text-slate-700">
                            <td>{item.name}</td>
                            <td>{item.mrp}</td>
                            <td>{item.quantity}</td>
                            <td>{item.amount.toFixed(1)}</td>
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
    </div>
  );
};
