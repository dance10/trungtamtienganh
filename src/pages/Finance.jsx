import React, { useState, useEffect } from 'react';
import { executeApi } from '../api';
import { Search, Plus, Filter, Download, DollarSign, TrendingUp, TrendingDown, Loader2, X, Printer, FileText } from 'lucide-react';

// ===== MODAL IN BIÊN LAI =====
function PrintReceiptModal({ isOpen, onClose, htmlContent }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Printer size={20} className="text-blue-600" /> Print Preview
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X size={20} /></button>
        </div>
        <div className="flex-1 bg-slate-100 p-8 overflow-auto border-b border-slate-200 flex justify-center">
          <div className="bg-white shadow-xl shadow-slate-200/50 w-full max-w-[21cm] min-h-[29.7cm] relative">
            <iframe
              title="Receipt"
              srcDoc={htmlContent}
              className="w-full h-full border-none absolute inset-0"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Đóng</button>
          <button onClick={() => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(htmlContent);
              printWindow.document.close();
              printWindow.focus();
              printWindow.print();
            }
          }} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer shadow-sm">
            <Printer size={16} /> In Biên Lai Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MODAL LẬP PHIẾU THU =====
function TransactionModal({ isOpen, onClose, onSaved, onShowPrint }) {
  const [form, setForm] = useState({ studentId: '', amount: '', content: '', method: 'Chuyển khoản' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ studentId: '', amount: '', content: '', method: 'Chuyển khoản' });
  }, [isOpen]);

  const handleSave = async () => {
    if (!form.amount || isNaN(form.amount.replace(/,/g, ''))) return alert('Vui lòng nhập số tiền hợp lệ');
    setSaving(true);
    try {
      const numericAmount = Number(String(form.amount).replace(/,/g, ''));
      const res = await executeApi('addTransaction', {
        studentId: form.studentId || 'KHACH_LE',
        amount: numericAmount,
        date: new Date().toISOString().slice(0, 10),
        content: form.content || 'Nộp tiền mặt',
        method: form.method
      });
      if (res.success) {
        onSaved();
        const confirmPrint = window.confirm('Lập phiếu thành công! Bạn có muốn in biên lai không?');
        if (confirmPrint) {
          try {
            const printRes = await executeApi('getReceiptHtml', { transactionId: res.data?.id });
            if (printRes.success && printRes.data) {
              onShowPrint(printRes.data);
            } else {
              alert('Không thể tạo file in: ' + printRes.error);
            }
          } catch(e) { alert('Lỗi lấy iframe in'); }
        }
        onClose();
      } else {
        alert(res.error || 'Có lỗi xảy ra');
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-emerald-600" />
            Lập Phiếu Thu
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mã Học Viên (Tùy chọn)</label>
            <input type="text" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} placeholder="VD: HV001" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Số Tiền (VNĐ) <span className="text-rose-500">*</span></label>
            <input type="text" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="500,000" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-emerald-700" />
            <p className="text-xs text-slate-400 mt-1">Nhập số âm để chi tiền (Hoàn phí)</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nội Dung</label>
            <input type="text" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Nộp học phí lớp TAA1" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phương thức</label>
            <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option>Chuyển khoản</option>
              <option>Tiền mặt</option>
              <option>Quẹt thẻ</option>
              <option>Công nợ</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Xử lý...</> : 'Tạo Phiếu Thu'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpense: 0 });
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [printModalInfo, setPrintModalInfo] = useState({ isOpen: false, html: '' });

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
      String(t.content || '').toLowerCase().includes(term) ||
      String(t.studentId || '').toLowerCase().includes(term) ||
      String(t.collector || '').toLowerCase().includes(term) ||
      String(t.id || '').toLowerCase().includes(term)
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
          <button onClick={() => setTxModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
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
                <th className="px-6 py-4 font-semibold border-b border-slate-200 text-center">In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 bg-slate-50/30">
                    <Loader2 className="animate-spin mx-auto mb-3 text-emerald-500" size={28}/> 
                    <span className="font-medium">Đang đồng bộ sổ quỹ Google Sheets...</span>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 bg-slate-50/30">
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
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={async () => {
                          try {
                            const printRes = await executeApi('getReceiptHtml', { transactionId: t.id });
                            if (printRes.success && printRes.data) {
                              setPrintModalInfo({ isOpen: true, html: printRes.data });
                            } else { alert('Chưa hỗ trợ in phiếu này hoặc có lỗi.'); }
                          } catch(e) { }
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded cursor-pointer" title="In Biên Lai"
                      >
                        <Printer size={16} />
                      </button>
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
      
      <TransactionModal isOpen={txModalOpen} onClose={() => setTxModalOpen(false)} onSaved={fetchTransactions} onShowPrint={(html) => setPrintModalInfo({ isOpen: true, html })} />
      <PrintReceiptModal isOpen={printModalInfo.isOpen} onClose={() => setPrintModalInfo({ isOpen: false, html: '' })} htmlContent={printModalInfo.html} />
    </div>
  );
}
