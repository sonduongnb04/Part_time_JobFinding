/**
 * =============================================================================
 * AUTH LAYOUT - Layout cho các trang đăng nhập/đăng ký
 * =============================================================================
 * Component layout wrapper cho các trang authentication (Login, Register, Forgot Password).
 * 
 * Cấu trúc:
 * - Bên trái: Form (children)
 * - Bên phải: Background decorative pattern
 * 
 * Props:
 * @param {React.ReactNode} children - Form content
 * @param {string} title - Tiêu đề trang
 * @param {string} subtitle - Phụ đề (VD: "Chưa có tài khoản?")
 * @param {string} linkText - Text của link (VD: "Đăng ký")
 * @param {string} linkTo - URL của link (VD: "/register")
 * =============================================================================
 */

import { Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * AuthLayout - Layout cho trang authentication
 */
const AuthLayout = ({ children, title, subtitle, linkText, linkTo }) => {
  return (
    <div className="min-h-screen flex">

      {/* ============================================== */}
      {/* BÊN TRÁI - Phần form */}
      {/* ============================================== */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white">
        <div className="max-w-md mx-auto w-full">

          {/* Logo - Click để về trang chủ */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">MyJob</span>
          </Link>

          {/* Tiêu đề trang */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>

          {/* Phụ đề với link chuyển đổi */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-600">
              {subtitle}{' '}
              <Link to={linkTo} className="text-primary-600 hover:text-primary-700 font-medium">
                {linkText}
              </Link>
            </p>
          </div>

          {/* Nội dung form (children) */}
          {children}
        </div>
      </div>

      {/* ============================================== */}
      {/* BÊN PHẢI - Background decorative */}
      {/* Chỉ hiển thị trên màn hình lớn (lg trở lên) */}
      {/* ============================================== */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">

        {/* Layer 1: Pattern kẻ chéo */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1e3a8a 25%, transparent 25%),
              linear-gradient(-45deg, #1e3a8a 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1e3a8a 75%),
              linear-gradient(-45deg, transparent 75%, #1e3a8a 75%)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
          }}
        />

        {/* Layer 2: Pattern kẻ chéo overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1e40af 25%, transparent 25%),
              linear-gradient(-45deg, #1e40af 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1e40af 75%),
              linear-gradient(-45deg, transparent 75%, #1e40af 75%)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '20px 20px, 20px 50px, 50px -10px, -10px 20px'
          }}
        />
      </div>
    </div>
  )
}

export default AuthLayout
