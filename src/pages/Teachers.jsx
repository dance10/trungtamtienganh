import React, { useState, useEffect } from 'react';
import { executeApi } from '../api';
import { Search, Plus, Filter, Loader2, Users, Mail, Phone, BookOpen } from 'lucide-react';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await executeApi('getTeachers');
      if (res.success) {
        setTeachers(res.data.teachers || []);
      } else {
        setError('Lỗi tải danh sách giáo viên: ' + res.error);
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone?.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Giáo viên</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách đội ngũ giáo viên trung tâm</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
          <Plus size={16} />
          <span>Thêm giáo viên</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên, Mã số hoặc Số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
          <Filter size={16} />
          <span>Lọc nâng cao</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
          <p className="text-sm font-medium">Đang tải danh sách giáo viên...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                  {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{teacher.name}</h3>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{teacher.id}</span>
                </div>
              </div>
              
              <div className="space-y-3 mt-2 flex-1">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{teacher.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{teacher.email || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Users size={16} className="text-slate-400" />
                  <span className="truncate">Cơ sở: {teacher.location || 'Chưa phân bổ'}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${teacher.status === 'Đang dạy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' : 'bg-slate-100 text-slate-600 border border-slate-200/50'}`}>
                  {teacher.status || 'Chưa xác định'}
                </span>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
          {filteredTeachers.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
              Không tìm thấy giáo viên nào
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Teachers;
