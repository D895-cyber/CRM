export default function MyVouchers({ user, vouchers = [], loading = false, error = '', fetchVouchers }) {
  // Component now receives vouchers as props from parent

  const statusBadge = (status) => {
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Verified') return 'bg-blue-100 text-blue-800';
    if (status === 'Paid') return 'bg-green-100 text-green-800';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
      <h2 className="text-2xl font-bold text-teal-700 mb-6">My Vouchers</h2>
      {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow bg-white">
          <table className="min-w-full table-auto">
            <thead className="bg-gradient-to-r from-green-50 to-teal-100 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-bold">Bill</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Amount</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Date</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Description</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Status</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v._id} className="even:bg-gray-50 hover:bg-green-50 transition-colors">
                  <td className="px-5 py-3">
                    <a href={`http://localhost:3000/${v.billFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                  </td>
                  <td className="px-5 py-3">₹{v.amount}</td>
                  <td className="px-5 py-3">{v.date && v.date.substring(0,10)}</td>
                  <td className="px-5 py-3">{v.description}</td>
                  <td className="px-5 py-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(v.status)}`}>{v.status}</span></td>
                  <td className="px-5 py-3">{v.createdAt && v.createdAt.substring(0,10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 