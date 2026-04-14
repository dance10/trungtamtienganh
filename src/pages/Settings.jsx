import React, { useState, useEffect } from 'react';
import { executeApi } from '../api';
import { Settings as SettingsIcon, Loader2, Building, Layers, Users, Landmark, Banknote } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await executeApi('getConfigData');
      if (res.success) {
        setConfig(res.data.config || {});
      } else {
        setError('Lỗi tải cấu hình: ' + res.error);
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const ConfigSection = ({ title, icon, items, description }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-200">
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-400 italic">Chưa có dữ liệu</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <SettingsIcon size={24} className="text-slate-600" />
          Cài đặt Hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý cấu hình danh mục của Trung tâm</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
          <p className="text-sm font-medium">Đang đồng bộ cấu hình...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConfigSection 
            title="Danh sách Cơ sở" 
            icon={<Building size={20} />} 
            description="Các chi nhánh/cơ sở đào tạo của trung tâm"
            items={config?.DanhSachCoSo} 
          />
          <ConfigSection 
            title="Loại chi phí (Fee Types)" 
            icon={<Layers size={20} />} 
            description="Các loại học phí và phụ phí thu của học viên"
            items={config?.LoaiChiPhi} 
          />
          <ConfigSection 
            title="Người chi" 
            icon={<Users size={20} />} 
            description="Tên người chi các khoản phí cố định"
            items={config?.NguoiChi} 
          />
          <ConfigSection 
            title="Thu ngân / Người thu" 
            icon={<Landmark size={20} />} 
            description="Tên nhân viên phụ trách thu ngân"
            items={config?.NguoiThu} 
          />
          <ConfigSection 
            title="Hình thức thanh toán" 
            icon={<Banknote size={20} />} 
            description="VD: Tiền mặt, Chuyển khoản, Quẹt thẻ..."
            items={config?.HinhThucTT} 
          />
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
            <h3 className="font-bold text-blue-800 mb-2">Tích hợp VietQR (Cấu hình)</h3>
            <p className="text-sm text-blue-600/80 mb-4">Thông tin tài khoản ngân hàng nhận học phí hiện đang được thiết lập tĩnh trên server. Vui lòng liên hệ Admin để thay đổi.</p>
            <div className="bg-white/60 p-3 rounded-lg border border-blue-200/50">
              <div className="text-xs font-semibold text-slate-500 mb-1">Ngân hàng: <span className="text-slate-800">MB Bank</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
