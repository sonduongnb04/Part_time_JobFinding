/**
 * =============================================================================
 * LOGIN PAGE - Trang đăng nhập
 * =============================================================================
 * Trang cho phép người dùng đăng nhập vào hệ thống.
 * 
 * Tính năng:
 * - Form đăng nhập với email và mật khẩu
 * - Validate dữ liệu trước khi gửi
 * - Hiển thị/ẩn mật khẩu
 * - Hiển thị thông báo lỗi từ API
 * - Link đến trang quên mật khẩu
 * - Redirect theo role sau khi đăng nhập
 * 
 * Flow đăng nhập:
 * 1. Người dùng nhập email + password
 * 2. Gọi API /Auth/login
 * 3. Lưu tokens vào localStorage
 * 4. Redirect: Admin/Employer → Dashboard, Student → Home
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { authApi } from '../services/api'

/**
 * Component Login - Trang đăng nhập
 */
const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()  // Để lấy message từ trang trước (VD: sau khi đăng ký thành công)

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Dữ liệu form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)  // Hiển thị/ẩn password
  const [errors, setErrors] = useState({})                 // Lỗi validation từng field
  const [loading, setLoading] = useState(false)            // Đang gửi request
  const [apiError, setApiError] = useState('')             // Lỗi từ API
  const [successMessage, setSuccessMessage] = useState('') // Thông báo thành công

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  /**
   * Hiển thị message từ trang trước (nếu có)
   * VD: "Đăng ký thành công! Vui lòng đăng nhập."
   */
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
    }
  }, [location])

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Xử lý khi người dùng thay đổi giá trị input
   * @param {Event} e - Event từ input
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Xóa lỗi khi user bắt đầu nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setApiError('')
    setSuccessMessage('')
  }

  /**
   * Validate form trước khi submit
   * @returns {boolean} Form hợp lệ hay không
   */
  const validate = () => {
    const newErrors = {}

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng'
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Xử lý submit form đăng nhập
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    // Validate trước khi gửi
    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      // Gọi API đăng nhập
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      })

      if (response.data?.success && response.data?.data) {
        const data = response.data.data

        // Lưu tokens vào localStorage
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // Lưu thông tin user
        const userData = {
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          roles: data.roles || []
        }
        localStorage.setItem('user', JSON.stringify(userData))

        // Redirect theo role
        // - ADMIN → Admin Dashboard
        // - EMPLOYER → Employer Dashboard
        // - STUDENT/CANDIDATE → Trang chủ
        if (data.roles?.includes('ADMIN')) {
          navigate('/admin/dashboard')
        } else if (data.roles?.includes('EMPLOYER')) {
          navigate('/dashboard')
        } else {
          navigate('/')
        }

        // Reload để cập nhật Header
        window.location.reload()
      } else {
        setApiError(response.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      // Xử lý lỗi từ API
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.join(', ') ||
        'Email hoặc mật khẩu không đúng'
      setApiError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <AuthLayout
      title="Chào mừng trở lại."
      subtitle="Chưa có tài khoản?"
      linkText="Đăng ký ngay"
      linkTo="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Thông báo thành công (nếu có) */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* ============================================== */}
        {/* INPUT EMAIL */}
        {/* ============================================== */}
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Địa chỉ email"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.email
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500'
              }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* ============================================== */}
        {/* INPUT PASSWORD */}
        {/* ============================================== */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${errors.password
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-primary-500'
                }`}
            />
            {/* Nút hiển thị/ẩn mật khẩu */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Link quên mật khẩu */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Hiển thị lỗi từ API */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {apiError}
          </div>
        )}

        {/* Nút đăng nhập */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            'Đang đăng nhập...'
          ) : (
            <>
              Đăng nhập <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
