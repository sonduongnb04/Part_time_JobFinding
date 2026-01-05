/**
 * =============================================================================
 * HEADER COMPONENT - Thanh điều hướng chính
 * =============================================================================
 * Component thanh header hiển thị trên tất cả các trang.
 * 
 * Tính năng:
 * - Logo và navigation links
 * - Thanh tìm kiếm việc làm
 * - Chọn quốc gia và ngôn ngữ
 * - Hiển thị trạng thái đăng nhập/đăng xuất
 * - Icon tin nhắn với badge số tin chưa đọc (real-time)
 * - Link đến Admin Dashboard (chỉ cho Admin)
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Globe, Flag, Briefcase, MessageCircle } from 'lucide-react'
import { chatApi } from '../services/api'
import chatSignalR from '../services/signalr'

/**
 * Component Header - Thanh điều hướng chính của ứng dụng
 */
const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  const [language, setLanguage] = useState('English')     // Ngôn ngữ đang chọn
  const [country, setCountry] = useState('Vietnam')       // Quốc gia đang chọn
  const [isAuthenticated, setIsAuthenticated] = useState(false)  // Đã đăng nhập chưa
  const [user, setUser] = useState(null)                  // Thông tin user
  const [unreadCount, setUnreadCount] = useState(0)       // Số tin nhắn chưa đọc
  const [hasNewMessage, setHasNewMessage] = useState(false)  // Có tin nhắn mới (để animation)

  // Check roles and path
  const isEmployer = user?.roles?.some(r => r.toUpperCase() === 'EMPLOYER')
  const isAdminScreen = location.pathname.startsWith('/admin')

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Lấy ID người dùng hiện tại từ JWT token
   * @returns {number|null} User ID hoặc null nếu chưa đăng nhập
   */
  const getCurrentUserId = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return null
    try {
      // Decode JWT payload (phần giữa của token)
      const payload = JSON.parse(atob(token.split('.')[1]))
      return parseInt(payload.nameid || payload.sub)
    } catch {
      return null
    }
  }

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  /**
   * Effect 1: Kiểm tra trạng thái đăng nhập và lấy thông tin user
   */
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')
    setIsAuthenticated(!!token)

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)

        // Lấy roles từ JWT token để xác định quyền admin
        if (token) {
          try {
            // Decode JWT token
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);

            // Lấy role từ các claim types chuẩn của .NET
            const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'] || payload['roles'];

            // Normalize thành array (có thể là string hoặc array)
            const roles = Array.isArray(role) ? role : (role ? [role] : []);
            parsedUser.roles = roles;
          } catch (e) {
            console.error('Lỗi parse token:', e)
          }
        }

        setUser(parsedUser)
      } catch (e) {
        console.error('Lỗi parse user data:', e)
      }
    }

    // Lấy số tin nhắn chưa đọc nếu đã đăng nhập
    if (token) {
      fetchUnreadCount()
      // Refresh mỗi 30 giây
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  /**
   * Effect 2: Lắng nghe tin nhắn mới qua SignalR để cập nhật badge real-time
   */
  useEffect(() => {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) return

    // Đăng ký lắng nghe tin nhắn mới
    const unsubMessage = chatSignalR.onMessage((message) => {
      // Chỉ tăng count nếu tin nhắn từ người khác
      if (message.senderId !== currentUserId) {
        setUnreadCount(prev => prev + 1)
        setHasNewMessage(true)

        // Tắt animation sau 1 giây
        setTimeout(() => setHasNewMessage(false), 1000)
      }
    })

    // Cleanup khi component unmount
    return () => {
      unsubMessage()
    }
  }, [])

  // ==========================================================================
  // API FUNCTIONS
  // ==========================================================================

  /**
   * Lấy số tin nhắn chưa đọc từ API
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await chatApi.getUnreadCount()
      if (response.data.success) {
        setUnreadCount(response.data.data)
      }
    } catch (error) {
      console.error('Không thể lấy số tin chưa đọc:', error)
    }
  }

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Xử lý đăng xuất
   * Xóa tất cả dữ liệu đăng nhập và chuyển về trang chủ
   */
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    navigate('/')
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <header className="bg-white shadow-sm">

      {/* ============================================== */}
      {/* TOP NAVIGATION - Thanh điều hướng phụ */}
      {/* ============================================== */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-primary-600 text-sm font-medium">Trang chủ</Link>
              {/* Hiển thị nút Đăng tin cho tất cả user đã đăng nhập TRỪ Admin */}
              {isAuthenticated && !user?.roles?.some(r => r.toUpperCase() === 'ADMIN') && (
                <Link to="/post-job" className="text-gray-700 hover:text-primary-600 text-sm font-medium">Đăng tin</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================== */}
      {/* MAIN HEADER - Thanh chính */}
      {/* ============================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">MyJob</span>
          </Link>

          {/* Thanh tìm kiếm */}


          {/* ============================================== */}
          {/* PHẦN BÊN PHẢI - Các action buttons */}
          {/* ============================================== */}
          <div className="flex items-center space-x-4">

            {/* Dropdown chọn quốc gia */}
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="Vietnam">Việt Nam</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
              <Flag className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Dropdown chọn ngôn ngữ */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Vietnamese">Tiếng Việt</option>
              </select>
              <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* ============================================== */}
            {/* PHẦN BUTTONS - Thay đổi theo trạng thái đăng nhập */}
            {/* ============================================== */}
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-4">
                  {/* Tên người dùng */}
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.fullName || user?.email || 'Người dùng'}
                  </span>

                  {/* Link Admin Dashboard - Chỉ hiển thị cho Admin */}
                  {user?.roles?.includes('ADMIN') && (
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-md"
                    >
                      Quản trị
                    </Link>
                  )}

                  {/* Icon tin nhắn với badge số tin chưa đọc */}
                  <Link
                    to="/chat"
                    className={`relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors ${hasNewMessage ? 'animate-bounce' : ''}`}
                    title="Tin nhắn"
                    onClick={() => setUnreadCount(0)}  // Reset count khi click
                  >
                    <MessageCircle className={`h-6 w-6 ${hasNewMessage ? 'text-primary-600' : ''}`} />
                    {/* Badge số tin chưa đọc */}
                    {unreadCount > 0 && (
                      <span className={`absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow ${hasNewMessage ? 'animate-ping-once' : ''}`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Nút đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-primary-600 font-medium hover:text-primary-700"
                >
                  Đăng xuất
                </button>

                {/* Nút đăng tin - Chỉ dành cho Employer và không ở màn hình Admin */}
                {isEmployer && !isAdminScreen && (
                  <Link
                    to="/post-job"
                    className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Đăng tin
                  </Link>
                )}
              </>
            ) : (
              /* Chưa đăng nhập */
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 font-medium hover:text-primary-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
