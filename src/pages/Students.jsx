import React, { useState, useEffect } from 'react';
import { executeApi } from '../api';
import { Search, Plus, Filter, MoreVertical, Loader2, X, UserPlus, Pencil, Trash2 } from 'lucide-react';

// ===== MODAL THÊM/SỬA HỌC VIÊN =====
function StudentModal({ isOpen, onClose, onSaved, student, classes }) {
  const [form, setForm] = useState({ name: '', dob: '', parentName: '', phone: '', location: '', classIds: [] });
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (student) {
      setForm({ name: student.name || '', dob: student.dob || '', parentName: student.parentName || '', phone: student.phone || '', location: student.location || '', classIds: [] });
    } else {
      setForm({ name: '', dob: '', parentName: '', phone: '', location: '', classIds: [] });
    }
  }, [student, isOpen]);

  useEffect(() => {
    executeApi('getConfigData').then(res => {
      if (res.success && res.data?.config?.DanhSachCoSo) {
        setLocations(res.data.config.DanhSachCoSo);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Vui lòng nhập tên học viên');
    setSaving(true);
    try {
      const action = student ? 'editStudent' : 'addStudent';
      const payload = student ? { ...form, id: student.id } : form;
      const res = await executeApi(action, payload);
      if (res.success) {
        onSaved();
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            {student ? 'Sửa thông tin Học viên' : 'Thêm Học viên mới'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên <span className="text-rose-500">*</span></label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nguyễn Văn A" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày sinh</label>
              <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Điện thoại PH</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0901234567" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên phụ huynh</label>
            <input type="text" value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} placeholder="Nguyễn Văn B" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cơ sở</label>
            <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">-- Chọn cơ sở --</option>
              {locations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
            </select>
          </div>
          {!student && classes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi danh lớp học (tùy chọn)</label>
              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                {classes.map(cls => (
                  <label key={cls.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={form.classIds.includes(cls.id)} onChange={e => {
                      setForm(prev => ({...prev, classIds: e.target.checked ? [...prev.classIds, cls.id] : prev.classIds.filter(id => id !== cls.id)}));
                    }} className="rounded border-slate-300" />
                    <span className="font-medium text-slate-700">{cls.name || cls.courseDisplayName || cls.id}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : student ? 'Cập nhật' : 'Thêm học viên'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== TRANG CHÍNH =====
export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await executeApi('getStudentsPage', { page: 1, pageSize: 500 });
      setStudents(res.data?.studentsOnPage || res.data?.allStudents || []);
    } catch (error) {
      console.error('Lỗi tải học viên:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await executeApi('getCoursesAndClasses');
      setClasses(res.data?.classes || []);
    } catch (error) {
      console.error('Lỗi tải danh sách lớp:', error);
    }
  };

  const handleDelete = async (student) => {
    if (!confirm(`Bạn có chắc muốn xóa học viên "${student.name}"?`)) return;
    try {
      const res = await executeApi('deleteStudent', { studentId: student.id });
      if (res.success) fetchStudents();
      else alert(res.error);
    } catch (e) {
      alert('Lỗi xóa: ' + e.message);
    }
  };

  const filteredStudents = students.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (s.name || '').toLowerCase().includes(term) || (s.phone || '').includes(term) || (s.parentName || '').toLowerCase().includes(term) || (s.id || '').toLowerCase().includes(term);
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
        <button onClick={() => { setEditingStudent(null); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
          <Plus size={18} />
          Thêm Học viên
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm theo tên, SĐT hoặc phụ huynh..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
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
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500"><Loader2 size={28} className="animate-spin mx-auto mb-3 text-blue-500" />Đang đồng bộ dữ liệu...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500"><span className="block text-4xl mb-3">🔍</span>Không tìm thấy học viên nào.</td></tr>
              ) : (
                filteredStudents.map((student, i) => (
                  <tr key={student.id || i} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{student.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                    <td className="px-6 py-4 text-slate-600">{student.parentName || '-'}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{student.phone || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{student.location || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(student.status)}`}>{student.status || 'Đang học'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingStudent(student); setModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full cursor-pointer" title="Sửa"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(student)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-full cursor-pointer" title="Xóa"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-sm text-slate-500">
          <span>Tổng số: <strong className="text-slate-800">{filteredStudents.length}</strong> học viên</span>
        </div>
      </div>

      <StudentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchStudents} student={editingStudent} classes={classes} />
    </div>
  );
}
