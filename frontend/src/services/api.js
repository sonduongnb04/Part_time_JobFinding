/**
 * =============================================================================
 * API SERVICE - Dịch vụ gọi API
 * =============================================================================
 * File này chứa tất cả các hàm gọi API đến backend server.
 * Sử dụng thư viện Axios để thực hiện HTTP requests.
 * 
 * Cấu trúc:
 * - Cấu hình Axios instance với base URL và headers mặc định
 * - Interceptor để tự động thêm JWT token vào mỗi request
 * - Các API modules được phân nhóm theo chức năng
 * =============================================================================
 */

import axios from 'axios'

// Lấy URL API từ biến môi trường hoặc sử dụng giá trị mặc định
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Tạo Axios instance với cấu hình mặc định
 * - baseURL: URL gốc của API server
 * - headers: Content-Type mặc định là JSON
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

/**
 * Interceptor Request - Tự động thêm JWT token
 * Mỗi request gửi đi sẽ được kiểm tra:
 * - Nếu có accessToken trong localStorage → thêm vào header Authorization
 * - Định dạng: "Bearer <token>"
 */
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Thêm token vào header Authorization
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// =============================================================================
// TIN TUYỂN DỤNG (JOB POSTS) API
// =============================================================================
/**
 * API quản lý tin tuyển dụng
 * - getAll: Lấy danh sách tất cả tin (có phân trang)
 * - search: Tìm kiếm tin theo từ khóa
 * - getById: Lấy chi tiết 1 tin theo ID
 * - getByCategory: Lấy tin theo danh mục
 * - getByCompany: Lấy tin theo công ty
 * - create: Tạo tin mới
 * - update: Cập nhật tin
 * - delete: Xóa tin
 * - changeStatus: Thay đổi trạng thái tin
 */
export const jobPostsApi = {
  // Lấy tất cả tin tuyển dụng với phân trang
  getAll: (pageNumber = 1, pageSize = 10) =>
    api.get('/JobPosts', { params: { pageNumber, pageSize } }),

  // Tìm kiếm tin tuyển dụng theo các tiêu chí
  search: (params) =>
    api.get('/JobPosts/search', { params }),

  // Lấy chi tiết tin tuyển dụng theo ID
  getById: (id) =>
    api.get(`/JobPosts/${id}`),

  // Lấy tin tuyển dụng theo danh mục/ngành nghề
  getByCategory: (category, pageNumber = 1, pageSize = 10) =>
    api.get('/JobPosts/search', {
      params: { searchTerm: category, pageNumber, pageSize }
    }),

  // Lấy tin tuyển dụng của một công ty cụ thể
  getByCompany: (companyId, pageNumber = 1, pageSize = 10) =>
    api.get(`/JobPosts/company/${companyId}`, { params: { pageNumber, pageSize } }),

  // Tạo tin tuyển dụng mới
  create: (jobData) =>
    api.post('/JobPosts', jobData),

  // Cập nhật tin tuyển dụng
  update: (id, jobData) =>
    api.put(`/JobPosts/${id}`, jobData),

  // Xóa tin tuyển dụng
  delete: (id) =>
    api.delete(`/JobPosts/${id}`),

  // Thay đổi trạng thái tin (Active/Inactive/Closed)
  changeStatus: (id, status) =>
    api.patch(`/JobPosts/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    }),
}

// =============================================================================
// CÔNG TY (COMPANIES) API
// =============================================================================
/**
 * API quản lý thông tin công ty
 * - getAll: Lấy danh sách công ty
 * - search: Tìm kiếm công ty
 * - getById: Lấy thông tin công ty theo ID
 * - getMyCompany: Lấy thông tin công ty của người dùng hiện tại
 * - create: Tạo công ty mới
 * - update: Cập nhật thông tin công ty
 * - delete: Xóa công ty
 */
export const companiesApi = {
  // Lấy danh sách tất cả công ty
  getAll: (pageNumber = 1, pageSize = 10) =>
    api.get('/Companies', { params: { pageNumber, pageSize } }),

  // Tìm kiếm công ty
  search: (params) =>
    api.get('/Companies/search', { params }),

  // Lấy thông tin công ty theo ID
  getById: (id) =>
    api.get(`/Companies/${id}`),

  // Lấy thông tin công ty của người dùng đang đăng nhập
  getMyCompany: () =>
    api.get('/Companies/me'),

  // Đăng ký/tạo công ty mới
  create: (companyData) =>
    api.post('/Companies', companyData),

  // Cập nhật thông tin công ty
  update: (id, companyData) =>
    api.put(`/Companies/${id}`, companyData),

  // Xóa công ty
  delete: (id) =>
    api.delete(`/Companies/${id}`),
}

// =============================================================================
// YÊU CẦU ĐĂNG KÝ CÔNG TY (COMPANY REQUESTS) API - Dành cho Admin
// =============================================================================
/**
 * API quản lý yêu cầu đăng ký công ty (Admin only)
 * - getPending: Lấy danh sách yêu cầu chờ duyệt
 * - getById: Lấy chi tiết yêu cầu
 * - approve: Phê duyệt yêu cầu
 * - reject: Từ chối yêu cầu
 */
export const companyRequestsApi = {
  // Lấy danh sách yêu cầu đang chờ phê duyệt
  getPending: (pageNumber = 1, pageSize = 10) =>
    api.get('/CompanyRequests/pending', { params: { pageNumber, pageSize } }),

  // Lấy chi tiết yêu cầu đăng ký
  getById: (id) =>
    api.get(`/CompanyRequests/${id}`),

  // Phê duyệt yêu cầu đăng ký công ty
  approve: (requestId) =>
    api.post('/CompanyRequests/approve', { requestId }),

  // Từ chối yêu cầu đăng ký công ty (kèm lý do)
  reject: (requestId, rejectionReason) =>
    api.post('/CompanyRequests/reject', { requestId, rejectionReason }),
}

// =============================================================================
// HỒ SƠ ỨNG VIÊN (PROFILES) API
// =============================================================================
/**
 * API quản lý hồ sơ ứng viên
 * - getById: Lấy hồ sơ theo ID
 * - getMyProfile: Lấy hồ sơ của người dùng hiện tại
 */
export const profilesApi = {
  // Lấy hồ sơ ứng viên theo ID
  getById: (id) =>
    api.get(`/Profiles/${id}`),

  // Lấy hồ sơ của người dùng đang đăng nhập
  getMyProfile: () =>
    api.get('/Profiles/me'),
}

// =============================================================================
// ĐƠN ỨNG TUYỂN (APPLICATIONS) API
// =============================================================================
/**
 * API quản lý đơn ứng tuyển
 * - getByJobId: Lấy danh sách đơn ứng tuyển của một tin
 * - updateStatus: Cập nhật trạng thái đơn (Đang xem/Phỏng vấn/Nhận/Từ chối)
 * - getById: Lấy chi tiết đơn ứng tuyển
 */
export const applicationsApi = {
  // Lấy danh sách đơn ứng tuyển cho một tin tuyển dụng
  getByJobId: (jobId, pageNumber = 1, pageSize = 20) =>
    api.get(`/Applications/job/${jobId}`, { params: { pageNumber, pageSize } }),

  // Cập nhật trạng thái đơn ứng tuyển
  updateStatus: (id, statusId, notes) =>
    api.patch(`/Applications/${id}/status`, { statusId, notes }),

  // Lấy chi tiết đơn ứng tuyển
  getById: (id) =>
    api.get(`/Applications/${id}`),
}

// =============================================================================
// QUẢN TRỊ VIÊN (ADMIN) API
// =============================================================================
/**
 * API dành cho quản trị viên (Admin only)
 * - getDashboardStats: Lấy thống kê tổng quan
 * - getUsers: Lấy danh sách người dùng
 * - lockUser: Khóa tài khoản
 * - unlockUser: Mở khóa tài khoản
 * - updateJobStatus: Cập nhật trạng thái tin tuyển dụng
 * - deleteJob: Xóa tin tuyển dụng
 */
export const adminApi = {
  // Lấy thống kê tổng quan cho dashboard
  getDashboardStats: () =>
    api.get('/admin/stats'),

  // Lấy danh sách người dùng (có tìm kiếm và phân trang)
  getUsers: (search, pageNumber = 1, pageSize = 10) =>
    api.get('/admin/users', { params: { search, pageNumber, pageSize } }),
  getJobs: (search, pageNumber = 1, pageSize = 10) =>
    api.get('/admin/jobs', { params: { search, pageNumber, pageSize } }),

  // Khóa tài khoản người dùng
  lockUser: (id) =>
    api.post(`/admin/users/${id}/lock`),

  // Mở khóa tài khoản người dùng
  unlockUser: (id) =>
    api.post(`/admin/users/${id}/unlock`),

  // Cập nhật trạng thái tin tuyển dụng (Duyệt/Từ chối)
  updateJobStatus: (id, status) =>
    api.put(`/admin/jobs/${id}/status`, { status }),

  // Xóa tin tuyển dụng (Admin)
  deleteJob: (id) =>
    api.delete(`/admin/jobs/${id}`),
}

// =============================================================================
// NHẬT KÝ HỆ THỐNG (LOGS) API - Dành cho Admin
// =============================================================================
/**
 * API xem nhật ký hệ thống (Admin only)
 * - getActivityLogs: Lấy lịch sử hoạt động
 * - getErrorLogs: Lấy nhật ký lỗi
 * - getActivityStats: Lấy thống kê hoạt động
 * - getErrorStats: Lấy thống kê lỗi
 */
export const logsApi = {
  // Lấy lịch sử hoạt động của người dùng
  getActivityLogs: (userId, startDate, endDate, pageNumber = 1, pageSize = 50) =>
    api.get('/Logs/activities', { params: { userId, startDate, endDate, pageNumber, pageSize } }),

  // Lấy nhật ký lỗi hệ thống
  getErrorLogs: (level, startDate, endDate, pageNumber = 1, pageSize = 50) =>
    api.get('/Logs/errors', { params: { level, startDate, endDate, pageNumber, pageSize } }),

  // Lấy thống kê hoạt động theo thời gian
  getActivityStats: (startDate, endDate) =>
    api.get('/Logs/activities/stats', { params: { startDate, endDate } }),

  // Lấy thống kê lỗi theo thời gian
  getErrorStats: (startDate, endDate) =>
    api.get('/Logs/errors/stats', { params: { startDate, endDate } }),
}

// =============================================================================
// XÁC THỰC (AUTH) API
// =============================================================================
/**
 * API xác thực người dùng
 * - login: Đăng nhập
 * - register: Đăng ký tài khoản mới
 * - refreshToken: Làm mới access token
 */
export const authApi = {
  // Đăng nhập - trả về access token và refresh token
  login: (credentials) =>
    api.post('/Auth/login', credentials),

  // Đăng ký tài khoản mới
  register: (userData) =>
    api.post('/Auth/register', userData),

  // Làm mới access token bằng refresh token
  refreshToken: (refreshToken) =>
    api.post('/Auth/refresh', { refreshToken }),
}

// =============================================================================
// TIN NHẮN (CHAT) API
// =============================================================================
/**
 * API nhắn tin real-time
 * - getConversations: Lấy danh sách cuộc trò chuyện
 * - getOrCreateConversation: Tạo hoặc lấy cuộc trò chuyện với người khác
 * - getMessages: Lấy tin nhắn của cuộc trò chuyện
 * - sendMessage: Gửi tin nhắn (fallback khi SignalR không khả dụng)
 * - markAsRead: Đánh dấu đã đọc
 * - getUnreadCount: Lấy số tin nhắn chưa đọc
 */
export const chatApi = {
  // Lấy danh sách cuộc trò chuyện của người dùng (Inbox)
  getConversations: (pageNumber = 1, pageSize = 20) =>
    api.get('/Chat/conversations', { params: { pageNumber, pageSize } }),

  // Tạo hoặc lấy cuộc trò chuyện với người nhận
  getOrCreateConversation: (recipientId, jobPostId) =>
    api.post('/Chat/conversations', { recipientId, jobPostId }),

  // Lấy lịch sử tin nhắn của cuộc trò chuyện
  getMessages: (conversationId, pageNumber = 1, pageSize = 50) =>
    api.get(`/Chat/conversations/${conversationId}/messages`, { params: { pageNumber, pageSize } }),

  // Gửi tin nhắn mới (fallback HTTP khi SignalR không hoạt động)
  sendMessage: (dto) =>
    api.post('/Chat/messages', dto),

  // Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc
  markAsRead: (conversationId) =>
    api.post(`/Chat/conversations/${conversationId}/read`),

  // Lấy số lượng tin nhắn chưa đọc (hiển thị badge)
  getUnreadCount: () =>
    api.get('/Chat/unread-count'),
}

// Export Axios instance để sử dụng trực tiếp nếu cần
export default api
