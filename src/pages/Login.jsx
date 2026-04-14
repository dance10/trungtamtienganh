import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeApi } from '../api';
import { Loader2, Lock, User, AlertCircle } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await executeApi('apiLogin', { username, password });
      if (res.success && res.data) {
        // Lưu token và thông tin user
        localStorage.setItem('edu_token', res.data.token);
        localStorage.setItem('edu_user', JSON.stringify({
          email: res.data.userEmail,
          roles: res.data.userRole
        }));
        
        onLoginSuccess();
        navigate('/');
      } else {
        setError(res.error || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setError('Kết nối máy chủ bị gián đoạn. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] selection:bg-blue-100 selection:text-blue-900 text-slate-900 font-sans p-4">
      {/* Vercel inspired minimal background design */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-blue-50/50 to-indigo-50/50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white px-8 pt-10 pb-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center">
          
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
            <span className="text-2xl font-bold text-white leading-none">E</span>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 mb-1">EduPortal</h1>
          <p className="text-sm text-slate-500 mb-8 font-medium">Trung tâm Đào tạo</p>

          {error && (
            <div className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-100 mb-6 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tên đăng nhập</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                  placeholder="admin"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Đăng nhập hệ thống</span>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Dành riêng cho Quản trị viên và Giáo viên
        </p>
      </div>
    </div>
  );
};

export default Login;
