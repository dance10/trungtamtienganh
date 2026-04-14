import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, CircleDollarSign, Bell, Search, Menu, Loader2, LogOut, FileText, GraduationCap, Settings as SettingsIcon } from 'lucide-react';
import { executeApi } from './api';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Finance from './pages/Finance';
import Teachers from './pages/Teachers';
import Settings from './pages/Settings';
import Login from './pages/Login';

const Sidebar = ({ onLogout, isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Tổng quan', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Học sinh', path: '/students', icon: <Users size={20} /> },
    { name: 'Lớp học', path: '/classes', icon: <BookOpen size={20} /> },
    { name: 'Giáo viên', path: '/teachers', icon: <GraduationCap size={20} /> },
    { name: 'Thu ngân', path: '/finance', icon: <CircleDollarSign size={20} /> },
    { name: 'Cài đặt', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  const user = JSON.parse(localStorage.getItem('edu_user') || '{}');
  const role = user.roles ? user.roles[0] : 'Nhân viên';

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`w-64 bg-slate-900 min-h-screen flex flex-col text-white fixed z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">E</div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
              EduPortal
            </span>
          </div>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile after navigating
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 font-semibold border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-transparent'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
                {role.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col max-w-[120px]">
                <span className="text-sm font-semibold truncate">{user.email || 'Admin Center'}</span>
                <span className="text-xs text-slate-400">{role}</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors lg:opacity-0 lg:group-hover:opacity-100"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 w-full transition-all">
      <div className="flex items-center gap-4 text-slate-500">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
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
    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan Trung tâm</h1>
        {loading && <div className="flex items-center gap-2 text-blue-500 text-sm font-medium"><Loader2 size={16} className="animate-spin" /> Đang đồng bộ...</div>}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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

// --- AUTHENTICATION FLOW ---

const ProtectedLayout = ({ isAuthenticated, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      <Sidebar onLogout={onLogout} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('edu_token')
  );

  useEffect(() => {
    // Lắng nghe event unauthorized từ api.js
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('edu_token');
    localStorage.removeItem('edu_user');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />
        
        <Route path="/*" element={
          <ProtectedLayout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ProtectedLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
