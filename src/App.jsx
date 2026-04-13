import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, CircleDollarSign, Bell, Search, Menu, Loader2 } from 'lucide-react';
import { executeApi } from './api';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Finance from './pages/Finance';

const Sidebar = () => {
  const navItems = [
    { name: 'Tổng quan', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Học sinh', path: '/students', icon: <Users size={20} /> },
    { name: 'Lớp học', path: '/classes', icon: <BookOpen size={20} /> },
    { name: 'Thu ngân', path: '/finance', icon: <CircleDollarSign size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col text-white fixed">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">E</div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
            EduPortal
          </span>
        </div>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Admin Center</span>
            <span className="text-xs text-slate-400">Quản trị viên</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 w-full transition-all">
      <div className="flex items-center gap-4 text-slate-500">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh học sinh, lớp học..."
            className="pl-10 pr-4 py-2 bg-slate-100/80 border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 transition-all font-medium text-slate-700"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 text-slate-500">
        <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400">
          <Bell size={20} />
          <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    executeApi("getDashboardStats")
      .then(res => {
        if (res.success && res.data) {
          // getEnhancedDashboardData trả về: res.data.stats, res.data.revenueChartData, ...
          setStats(res.data.stats || res.data);
        }
      })
      .catch(err => {
        setError("Không thể lấy dữ liệu: " + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalStudents = stats?.totalStudents || 0;
  const totalClasses = stats?.totalClasses || 0;
  const revenueThisMonth = stats?.revenueThisMonth || 0;
  const expenseThisMonth = stats?.expenseThisMonth || 0;
  const profitThisMonth = stats?.profitThisMonth || 0;

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan Trung tâm</h1>
        {loading && <div className="flex items-center gap-2 text-blue-500 text-sm font-medium"><Loader2 size={16} className="animate-spin" /> Đang đồng bộ...</div>}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4"><Users size={20}/></div>
          <h3 className="text-slate-500 text-sm font-medium">Tổng học sinh</h3>
          {loading ? <div className="h-9 bg-slate-100 animate-pulse rounded mt-1 w-16"></div> : <p className="text-3xl font-bold text-slate-800 mt-1">{totalStudents.toLocaleString()}</p>}
          <span className="text-emerald-500 text-xs font-semibold mt-2 inline-block">Trực tiếp từ Database</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
           <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4"><BookOpen size={20}/></div>
          <h3 className="text-slate-500 text-sm font-medium">Tổng lớp học</h3>
          {loading ? <div className="h-9 bg-slate-100 animate-pulse rounded mt-1 w-16"></div> : <p className="text-3xl font-bold text-slate-800 mt-1">{totalClasses}</p>}
          <span className="text-emerald-500 text-xs font-semibold mt-2 inline-block">Real-time</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
           <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4"><LayoutDashboard size={20}/></div>
          <h3 className="text-slate-500 text-sm font-medium">Doanh thu tháng này</h3>
          {loading ? <div className="h-9 bg-slate-100 animate-pulse rounded mt-1 w-24"></div> : <p className="text-3xl font-bold text-slate-800 mt-1">{(revenueThisMonth / 1000000).toLocaleString()}<span className="text-lg">M</span></p>}
          <span className="text-slate-400 text-xs font-medium mt-2 inline-block">Chi: {(expenseThisMonth / 1000000).toLocaleString()}M</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${profitThisMonth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><CircleDollarSign size={20}/></div>
          <h3 className="text-slate-500 text-sm font-medium">Lợi nhuận tháng</h3>
          {loading ? <div className="h-9 bg-slate-100 animate-pulse rounded mt-1 w-24"></div> : <p className={`text-3xl font-bold mt-1 ${profitThisMonth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{(profitThisMonth / 1000000).toLocaleString()}<span className="text-lg">M</span></p>}
          <span className="text-slate-400 text-xs font-medium mt-2 inline-block">Doanh thu - Chi phí</span>
        </div>
      </div>
    </div>
  );
};

// Đã tích hợp các component riêng biệt.

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50/50 flex text-slate-800 font-sans">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/finance" element={<Finance />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App;
