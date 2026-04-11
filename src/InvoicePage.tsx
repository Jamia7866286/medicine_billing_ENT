interface BillItem {
  name: string;
  mrp: number;
  quantity: number;
  amount: number;
}

interface InvoicePageProps {
  date: string;
  billItems: BillItem[];
  todaySales: BillItem[];
  onBack: () => void;
}

const InvoicePage = ({ date, billItems, todaySales, onBack }: InvoicePageProps) => {
  const invoiceTotal = billItems.reduce((sum, item) => sum + item.amount, 0);
  const todayTotal = todaySales.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white border-2 border-black p-6 rounded-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Invoice</h2>
          <p className="text-sm text-gray-600">Date: {date}</p>
        </div>
        <button
          onClick={onBack}
          className="border-2 border-black px-4 py-2 bg-black text-white font-bold hover:bg-gray-800"
        >
          Back to Billing
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-3">Current Invoice</h3>
        {billItems.length === 0 ? (
          <p className="text-gray-600">No invoice items available.</p>
        ) : (
          <table className="w-full border-collapse border-2 border-black bg-gray-50">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-black p-2">Medicine</th>
                <th className="border-2 border-black p-2">Unit Price</th>
                <th className="border-2 border-black p-2">Qty</th>
                <th className="border-2 border-black p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, index) => (
                <tr key={index} className="text-center hover:bg-white">
                  <td className="border-2 border-black p-2">{item.name}</td>
                  <td className="border-2 border-black p-2">{item.mrp}</td>
                  <td className="border-2 border-black p-2">{item.quantity}</td>
                  <td className="border-2 border-black p-2 font-bold">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-4 text-right text-lg font-bold">
          Invoice Total: <span className="bg-yellow-300 px-3 border-2 border-black">{invoiceTotal}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3">Today's Sales History</h3>
        {todaySales.length === 0 ? (
          <p className="text-gray-600">No sales recorded for today yet.</p>
        ) : (
          <table className="w-full border-collapse border-2 border-black bg-gray-50">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-black p-2">Medicine</th>
                <th className="border-2 border-black p-2">Unit Price</th>
                <th className="border-2 border-black p-2">Qty</th>
                <th className="border-2 border-black p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {todaySales.map((item, index) => (
                <tr key={index} className="text-center hover:bg-white">
                  <td className="border-2 border-black p-2">{item.name}</td>
                  <td className="border-2 border-black p-2">{item.mrp}</td>
                  <td className="border-2 border-black p-2">{item.quantity}</td>
                  <td className="border-2 border-black p-2 font-bold">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-4 text-right text-lg font-bold">
          Total Today: <span className="bg-green-300 px-3 border-2 border-black">{todayTotal}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
