import React, { useState, useEffect } from 'react';
import { executeApi } from '../api';
import { Search, Plus, Filter, Download, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpense: 0 });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await executeApi('getTransactionsData');
      // Backend trả về: res.data.transactions (mảng objects với id, studentId, amount, date, content, collector, method)
      const rawRecords = res.data?.transactions || [];
      setTransactions(rawRecords);
      
      // Tính tổng thu/chi tháng hiện tại
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let totalRevenue = 0;
      let totalExpense = 0;
      rawRecords.forEach(t => {
        if (!t.date) return;
        const d = new Date(t.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          const amount = Number(t.amount || 0);
          if (amount >= 0) totalRevenue += amount;
          else totalExpense += Math.abs(amount);
        }
      });
      setSummary({ totalRevenue, totalExpense });
    } catch (error) {
      console.error('Lỗi tải giao dịch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = transactions.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.content || '').toLowerCase().includes(term) ||
      (t.studentId || '').toLowerCase().includes(term) ||
      (t.collector || '').toLowerCase().includes(term) ||
      (t.id || '').toLowerCase().includes(term)
    );
  });

  const profit = summary.totalRevenue - summary.totalExpense;

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tài chính & Thu ngân</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý giao dịch thu học phí và các khoản chi</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <Download size={18} />
            Xuất Sổ Quỹ
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <Plus size={18} />
            Lập Phiếu Thu
          </button>
        </div>
      </div>

      {/* KPI Cards - Dữ liệu thật từ API */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Tổng thu (Tháng này)</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{summary.totalRevenue.toLocaleString()}đ</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 border border-rose-100">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Tổng chi (Tháng này)</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{summary.totalExpense.toLocaleString()}đ</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow ring-1 ring-blue-500/10">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Lợi nhuận gộp</p>
            <h3 className={`text-2xl font-bold tracking-tight ${profit >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>{profit.toLocaleString()}đ</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo nội dung, mã giao dịch, người thu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer">
            <Filter size={16} />
            Bộ lọc tháng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Mã GD</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Ngày</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Mã HV</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Nội dung</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Người thu</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Số tiền (VNĐ)</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200 text-center">Phương thức</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 bg-slate-50/30">
                    <Loader2 className="animate-spin mx-auto mb-3 text-emerald-500" size={28}/> 
                    <span className="font-medium">Đang đồng bộ sổ quỹ Google Sheets...</span>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 bg-slate-50/30">
                     <span className="block text-4xl mb-3">🧾</span>
                     Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              ) : (
                filteredData.map((t, i) => (
                  <tr key={t.id || i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{t.id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-600">{t.date || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{t.studentId || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{t.content || 'Chưa phân loại'}</td>
                    <td className="px-6 py-4 text-slate-500">{t.collector || '-'}</td>
                    <td className={`px-6 py-4 text-right font-bold ${Number(t.amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {Number(t.amount) < 0 ? '' : '+'}{Number(t.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">{t.method || 'TM'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-sm text-slate-500">
          <span>Hiển thị: <strong className="text-slate-800">{filteredData.length}</strong> giao dịch</span>
        </div>
      </div>
    </div>
  );
}
