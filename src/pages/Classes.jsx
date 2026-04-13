import React, { useState, useEffect } from 'react';
import { executeApi } from '../api';
import { Search, Plus, Filter, Users, Calendar, MapPin, Loader2, MoreHorizontal } from 'lucide-react';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await executeApi('getCoursesAndClasses');
      const rawClasses = res.data?.classes || [];
      const formatted = rawClasses.map(c => {
        // Fallback cho Array format
        if (Array.isArray(c)) {
          return { id: c[0], name: c[1] || 'Chưa đặt tên', teacherId: c[2], schedule: c[4] + ' ' + c[5], location: c[10], course: c[15] };
        }
        return c; // Object format
      });
      setClasses(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.schedule?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Đào tạo & Lớp học</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý lớp học, lịch học và điểm danh</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={18} />
          Mở Lớp mới
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên lớp, lịch học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
            <Filter size={16} />
            Lọc Đang diễn ra
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
          <p className="text-slate-500 font-medium">Đang tải danh sách lớp học từ hệ thống...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="block text-4xl mb-3">📋</span>
           <p className="text-slate-500 font-medium">Không tìm thấy lớp học nào matching.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls, i) => (
            <div key={cls.id || i} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-100">
                    Khóa chính thức
                  </span>
                  <button className="text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 p-1 bg-slate-50 rounded-full">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{cls.name || 'Tên lớp đang cập nhật'}</h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                   Giáo viên: <span className="font-medium text-slate-700">GV Nội Bộ</span>
                </p>
                
                <div className="space-y-2 mt-auto bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <Calendar size={14} className="text-blue-500" />
                    <span>{cls.schedule || 'Chưa cập nhật lịch'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <MapPin size={14} className="text-rose-500" />
                    <span>{cls.location || 'Chưa rõ cơ sở'}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 p-3 bg-slate-50 flex gap-2">
                <button className="flex-1 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-bold py-2 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-1.5 cursor-pointer">
                  <Users size={14} /> Điểm danh
                </button>
                <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold py-2 rounded-lg shadow-sm transition-colors cursor-pointer">
                  Báo cáo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
