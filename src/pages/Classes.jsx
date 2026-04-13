import React, { useState, useEffect } from 'react';
import { executeApi } from '../api';
import { Search, Plus, Filter, BookOpen, MapPin, Calendar, Users, Clock, Loader2, X, Check, Minus, AlertCircle } from 'lucide-react';

// ===== MODAL ĐIỂM DANH =====
function AttendanceModal({ isOpen, onClose, classInfo }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && classInfo) {
      loadAttendanceData();
    }
  }, [isOpen, classInfo]);

  const loadAttendanceData = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const [sessionsRes, enrollRes, attendanceRes] = await Promise.all([
        executeApi('getSessionsData'),
        executeApi('getStudentsAndEnrollments'),
        executeApi('getAttendanceData'),
      ]);

      // Lọc buổi học của lớp này, sắp xếp theo ngày mới nhất
      const classSessions = (sessionsRes.data?.sessions || [])
        .filter(s => s.classId === classInfo.id)
        .sort((a, b) => new Date(b.date || b.startDateTime) - new Date(a.date || a.startDateTime));
      setSessions(classSessions);

      // Tìm buổi học hôm nay hoặc gần nhất
      const today = new Date().toISOString().slice(0, 10);
      const todaySession = classSessions.find(s => {
        const sDate = (s.date || s.startDateTime || '').slice(0, 10);
        return sDate === today;
      });
      const defaultSession = todaySession || classSessions[0];
      setSelectedSession(defaultSession);

      // Lấy học viên trong lớp qua enrollments
      const enrollments = enrollRes.data?.enrollments || [];
      const allStudents = enrollRes.data?.students || [];
      const enrolledIds = enrollments.filter(e => e.classId === classInfo.id).map(e => e.studentId);
      const classStudents = allStudents.filter(s => enrolledIds.includes(s.id));
      setStudentsInClass(classStudents);

      // Lấy điểm danh đã có cho buổi học
      const allAttendance = attendanceRes.data?.attendance || [];
      if (defaultSession) {
        const existing = {};
        allAttendance.filter(a => a.sessionId === defaultSession.id).forEach(a => {
          existing[a.studentId] = { status: a.status, note: a.note || '' };
        });
        setAttendanceRecords(existing);
      }
    } catch (e) {
      console.error('Lỗi tải điểm danh:', e);
    } finally {
      setLoading(false);
    }
  };

  const onSessionChange = async (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    setSelectedSession(session);
    setSaved(false);
    // Reload attendance for this session
    try {
      const attendanceRes = await executeApi('getAttendanceData');
      const allAttendance = attendanceRes.data?.attendance || [];
      const existing = {};
      allAttendance.filter(a => a.sessionId === sessionId).forEach(a => {
        existing[a.studentId] = { status: a.status, note: a.note || '' };
      });
      setAttendanceRecords(existing);
    } catch (e) {}
  };

  const toggleStatus = (studentId) => {
    setAttendanceRecords(prev => {
      const current = prev[studentId]?.status || '';
      const nextStatus = current === 'Có mặt' ? 'Vắng' : current === 'Vắng' ? 'Vắng (P)' : 'Có mặt';
      return { ...prev, [studentId]: { ...prev[studentId], status: nextStatus, note: prev[studentId]?.note || '' } };
    });
    setSaved(false);
  };

  const markAll = (status) => {
    const newRecords = {};
    studentsInClass.forEach(s => {
      newRecords[s.id] = { status, note: attendanceRecords[s.id]?.note || '' };
    });
    setAttendanceRecords(newRecords);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedSession) return alert('Chưa chọn buổi học');
    setSaving(true);
    try {
      const attendanceData = studentsInClass.map(s => ({
        studentId: s.id,
        status: attendanceRecords[s.id]?.status || 'Có mặt',
        note: attendanceRecords[s.id]?.note || '',
      }));
      const res = await executeApi('saveAttendanceForSession', { sessionId: selectedSession.id, attendanceData });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(res.error || 'Lỗi lưu điểm danh');
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const statusIcon = (status) => {
    if (status === 'Có mặt') return <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check size={16} strokeWidth={3} /></div>;
    if (status === 'Vắng') return <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><X size={16} strokeWidth={3} /></div>;
    if (status === 'Vắng (P)') return <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><AlertCircle size={16} /></div>;
    return <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"><Minus size={16} /></div>;
  };

  if (!isOpen) return null;

  const presentCount = studentsInClass.filter(s => attendanceRecords[s.id]?.status === 'Có mặt').length;
  const absentCount = studentsInClass.filter(s => attendanceRecords[s.id]?.status === 'Vắng' || attendanceRecords[s.id]?.status === 'Vắng (P)').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">📋 Điểm danh: {classInfo?.courseDisplayName || classInfo?.name || classInfo?.id}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{classInfo?.location} • {classInfo?.scheduleText}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-full transition-colors cursor-pointer"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><Loader2 size={28} className="animate-spin mx-auto mb-3 text-blue-500" /><p className="text-sm text-slate-500">Đang tải dữ liệu...</p></div>
        ) : (
          <>
            {/* Chọn buổi học */}
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
              <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">Buổi học:</label>
              <select value={selectedSession?.id || ''} onChange={e => onSessionChange(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {sessions.length === 0 ? <option>Chưa có buổi học nào</option> : sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {(s.date || s.startDateTime || '').slice(0, 10)} ({s.id})
                  </option>
                ))}
              </select>
              <div className="flex gap-1">
                <button onClick={() => markAll('Có mặt')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 cursor-pointer">Tất cả ✓</button>
                <button onClick={() => markAll('Vắng')} className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 cursor-pointer">Tất cả ✗</button>
              </div>
            </div>

            {/* Danh sách học viên */}
            <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-slate-100">
              {studentsInClass.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">Lớp chưa có học viên nào ghi danh.</div>
              ) : studentsInClass.map((student, i) => {
                const record = attendanceRecords[student.id] || {};
                return (
                  <div key={student.id} className="flex items-center gap-4 py-3 hover:bg-blue-50/30 rounded-lg px-2 -mx-2 transition-colors">
                    <span className="text-xs text-slate-400 w-6 text-right font-mono">{i + 1}</span>
                    <button onClick={() => toggleStatus(student.id)} className="cursor-pointer">
                      {statusIcon(record.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.id} • {student.phone || 'Chưa có SĐT'}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      record.status === 'Có mặt' ? 'bg-emerald-100 text-emerald-700' :
                      record.status === 'Vắng' ? 'bg-rose-100 text-rose-700' :
                      record.status === 'Vắng (P)' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {record.status || 'Chưa điểm'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex gap-4 text-xs font-semibold">
                <span className="text-emerald-600">✓ Có mặt: {presentCount}</span>
                <span className="text-rose-600">✗ Vắng: {absentCount}</span>
                <span className="text-slate-400">Tổng: {studentsInClass.length}</span>
              </div>
              <div className="flex gap-3">
                {saved && <span className="text-emerald-600 text-sm font-bold flex items-center gap-1"><Check size={16} /> Đã lưu!</span>}
                <button onClick={handleSave} disabled={saving || sessions.length === 0} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : '💾 Lưu điểm danh'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== TRANG CHÍNH =====
export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [attendanceClass, setAttendanceClass] = useState(null);

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await executeApi('getCoursesAndClasses');
      setClasses(res.data?.classes || []);
    } catch (e) {} finally { setLoading(false); }
  };

  const filtered = classes.filter(c => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (c.courseDisplayName || '').toLowerCase().includes(term) || (c.name || '').toLowerCase().includes(term) || (c.id || '').toLowerCase().includes(term);
  });

  const statusColor = (status) => {
    if (status === 'Khóa chính thức' || status === 'Đang hoạt động') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'Sắp khai giảng') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Đào tạo & Lớp học</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý lớp học, lịch học và điểm danh</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm cursor-pointer">
          <Plus size={18} /> Mở Lớp mới
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Tìm kiếm theo tên lớp, lịch học..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium cursor-pointer">
          <Filter size={16} /> Lọc Đang diễn ra
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={28} className="animate-spin mx-auto mb-3 text-blue-500" /><p className="text-sm text-slate-500">Đang tải danh sách lớp...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(cls => (
            <div key={cls.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusColor(cls.status)}`}>
                    {cls.status || 'Đang hoạt động'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{cls.name || cls.courseDisplayName || cls.id}</h3>
                <p className="text-sm text-slate-500 mb-3">Giáo viên: <span className="font-medium text-slate-700">{cls.teacherName || 'GV Nội Bộ'}</span></p>
                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {cls.scheduleText || 'Chưa cập nhật lịch'}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-rose-400" /> {cls.location || 'Chưa rõ'}</div>
                </div>
              </div>
              <div className="border-t border-slate-100 px-5 py-3 flex gap-2 bg-slate-50/50">
                <button onClick={() => setAttendanceClass(cls)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <Check size={16} /> Điểm danh
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <BookOpen size={16} /> Báo cáo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AttendanceModal isOpen={!!attendanceClass} onClose={() => setAttendanceClass(null)} classInfo={attendanceClass} />
    </div>
  );
}
