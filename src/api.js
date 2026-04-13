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
    
    // Phải gửi dưới dạng text/plain để tránh rắc rối với CORS Preflight của Google
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ action, payload }),
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("Lỗi parse JSON từ Google:", text);
      throw new Error("Phản hồi từ máy chủ không hợp lệ");
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
