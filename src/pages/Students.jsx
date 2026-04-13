import React, { useState, useEffect } from 'react';
import { executeApi } from '../api';
import { Search, Plus, Filter, MoreVertical, Loader2 } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ totalItems: 0 });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await executeApi('getStudentsPage', { page: 1, pageSize: 200 });
      // Backend trả về: res.data.studentsOnPage (mảng objects) & res.data.pagination
      const rawStudents = res.data?.studentsOnPage || res.data?.allStudents || res.data?.students || [];
      setStudents(rawStudents);
      setPagination(res.data?.pagination || { totalItems: rawStudents.length });
    } catch (error) {
      console.error('Lỗi tải danh sách học viên:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(term) || 
      (s.phone || '').includes(term) ||
      (s.parentName || '').toLowerCase().includes(term) ||
      (s.id || '').toLowerCase().includes(term)
    );
  });

  const statusBadge = (status) => {
    const map = {
      'Đang học': 'bg-emerald-100/80 text-emerald-700 border-emerald-200',
      'Nghỉ học': 'bg-rose-100/80 text-rose-700 border-rose-200',
      'Bảo lưu': 'bg-amber-100/80 text-amber-700 border-amber-200',
    };
    return map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Học viên</h1>
          <p className="text-sm text-slate-500 mt-1">Hồ sơ, lịch sử học tập và công nợ</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={18} />
          Thêm Học viên
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, SĐT hoặc phụ huynh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
            <Filter size={16} />
            Lọc theo Trạng thái
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Mã HV</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Họ và tên</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Phụ huynh</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Điện thoại</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Cơ sở</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Trạng thái</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 size={28} className="animate-spin mx-auto mb-3 text-blue-500" />
                    Đang đồng bộ dữ liệu với Google Sheets...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                    <span className="block text-4xl mb-3">🔍</span>
                    Không tìm thấy học viên nào.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, i) => (
                  <tr key={student.id || i} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {student.id || '---'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{student.name || 'Chưa có tên'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.parentName || '-'}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{student.phone || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{student.location || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(student.status)}`}>
                        {student.status || 'Đang học'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-blue-100 cursor-pointer">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-sm text-slate-500">
          <span>Tổng số: <strong className="text-slate-800">{filteredStudents.length}</strong> học viên</span>
        </div>
      </div>
    </div>
  );
}
