/**
 * =============================================================================
 * EMPLOYERS DASHBOARD LAYOUT - Layout cho trang dashboard nhà tuyển dụng
 * =============================================================================
 * Component layout wrapper cho các trang dành riêng cho nhà tuyển dụng.
 * 
 * Cấu trúc:
 * - Header: Logo, navigation links, actions (ngôn ngữ, thông báo, đăng tin)
 * - Sidebar: Menu điều hướng các chức năng
 * - Main content: Nội dung trang (children)
 * 
 * Các trang sử dụng layout này:
 * - /dashboard - Tổng quan
 * - /employer-profile - Hồ sơ công ty
 * - /post-job - Đăng tin mới
 * - /my-jobs - Quản lý tin tuyển dụng
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Briefcase,       // Icon cặp vali (Logo + My Jobs)
  LayoutDashboard, // Icon dashboard
  User,            // Icon người dùng
  PlusCircle,      // Icon thêm mới
  LogOut,          // Icon đăng xuất
  Phone,           // Icon điện thoại
  Globe,           // Icon địa cầu (ngôn ngữ)
  Bell,            // Icon chuông thông báo
  ChevronDown      // Icon mũi tên xuống
} from 'lucide-react'

/**
 * Component EmployersDashboardLayout
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung trang
 */
const EmployersDashboardLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [language, setLanguage] = useState('English')  // Ngôn ngữ đang chọn
  const [user, setUser] = useState(null)               // Thông tin user

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  /**
   * Lấy thông tin user từ localStorage khi component mount
   */
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Lỗi parse user data:', e)
      }
    }
  }, [])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Xử lý đăng xuất
   */
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  /**
   * Kiểm tra path hiện tại có active không
   * @param {string} path - Path cần kiểm tra
   */
  const isActive = (path) => {
    return location.pathname === path
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ============================================== */}
      {/* HEADER - Thanh header trên cùng */}
      {/* ============================================== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Phần trái: Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium ${location.pathname === '/' ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
              >
                Trang chủ
              </Link>

              <Link
                to="/my-jobs"
                className={`text-sm font-medium ${isActive('/my-jobs') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
              >
                Tin của tôi
              </Link>
            </div>

            {/* Phần giữa: Logo */}
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">MyJob</span>
            </div>

            {/* Phần phải: Actions */}
            <div className="flex items-center space-x-4">
              {/* Icon liên hệ */}
              <Phone className="w-5 h-5 text-gray-600 cursor-pointer hover:text-primary-600" />

              {/* Dropdown chọn ngôn ngữ */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer flex items-center"
                >
                  <option value="English">English</option>
                  <option value="Vietnamese">Tiếng Việt</option>
                </select>
                <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Icon thông báo */}
              <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-primary-600" />

              {/* Nút đăng tin */}
              <Link
                to="/post-job"
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Đăng tin
              </Link>

              {/* Avatar user */}
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer">
                <span className="text-primary-600 font-semibold text-sm">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">

        {/* ============================================== */}
        {/* SIDEBAR - Menu bên trái */}
        {/* ============================================== */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <div className="p-6">
            {/* Tiêu đề sidebar */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
              BẢNG ĐIỀU KHIỂN
            </h2>

            {/* Menu navigation */}
            <nav className="space-y-2">
              {/* Link: Tổng quan */}


              {/* Link: Hồ sơ công ty */}
              <Link
                to="/employer-profile"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/employer-profile')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Hồ sơ công ty</span>
              </Link>

              {/* Link: Đăng tin mới */}
              <Link
                to="/post-job"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/post-job')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <PlusCircle className="w-5 h-5" />
                <span className="font-medium">Đăng tin mới</span>
              </Link>

              {/* Link: Tin của tôi */}
              <Link
                to="/my-jobs"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/my-jobs')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">Tin của tôi</span>
              </Link>
            </nav>

            {/* ============================================== */}
            {/* NÚT ĐĂNG XUẤT */}
            {/* ============================================== */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ============================================== */}
        {/* MAIN CONTENT - Nội dung chính */}
        {/* ============================================== */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default EmployersDashboardLayout
