const SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

/**
 * Thực thi lệnh gọi API xuống Google Apps Script Backend
 * @param {string} action - Tên route tương ứng trong doPost của Code.js
 * @param {object} payload - Các tham số gửi kèm (tùy chọn)
 * @returns {Promise<any>}
 */
export const executeApi = async (action, payload = {}) => {
  try {
    console.log(`[API Calling] 👉 Action: ${action}`, payload);
    
    // Lấy token từ localStorage (nếu có)
    const token = localStorage.getItem('edu_token');
    
    const requestBody = { action, payload };
    if (token) {
      requestBody.token = token;
    }

    // Phải gửi dưới dạng text/plain để tránh rắc rối với CORS Preflight của Google
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (error) {
      console.error("Lỗi parse JSON từ Google:", text, error);
      throw new Error("Phản hồi từ máy chủ không hợp lệ");
    }

    // Nếu trả về Unauthorized, có nghĩa là token hết hạn hoặc không hợp lệ -> Xóa localStorage & redirect
    if (result.error === "Unauthorized") {
      localStorage.removeItem('edu_token');
      localStorage.removeItem('edu_user');
      window.dispatchEvent(new Event('unauthorized'));
      throw new Error("Phiên đăng nhập hết hạn.");
    }

    if (!result.success) {
      throw new Error(result.error || "Lỗi không xác định từ Backend");
    }

    console.log(`[API Response] 🟢 ${action}:`, result);
    return result;
  } catch (error) {
    console.error(`[API Error] 🔴 ${action}:`, error);
    throw error;
  }
};
