/**
 * =============================================================================
 * REGISTER PAGE - Trang đăng ký tài khoản
 * =============================================================================
 * Trang cho phép người dùng mới đăng ký tài khoản.
 * 
 * Tính năng:
 * - Form đăng ký với các trường: Họ tên, Username, Email, Mật khẩu
 * - Chọn loại tài khoản: Nhà tuyển dụng (EMPLOYER) hoặc Ứng viên (STUDENT)
 * - Validate dữ liệu đầu vào
 * - Hiển thị/ẩn mật khẩu
 * - Checkbox đồng ý điều khoản sử dụng
 * 
 * Flow đăng ký:
 * 1. Người dùng điền thông tin
 * 2. Click "Tạo tài khoản"
 * 3. Gọi API /Auth/register
 * 4. Redirect đến trang Login với thông báo thành công
 * =============================================================================
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, ChevronDown } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { authApi } from '../services/api'

/**
 * Component Register - Trang đăng ký
 */
const Register = () => {
  const navigate = useNavigate()

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',           // Họ và tên
    username: '',           // Tên đăng nhập (tùy chọn)
    email: '',              // Email
    password: '',           // Mật khẩu
    confirmPassword: '',    // Xác nhận mật khẩu
    accountType: 'EMPLOYER', // Loại tài khoản: EMPLOYER hoặc STUDENT
    agreeToTerms: false,    // Đã đồng ý điều khoản chưa
  })
  const [showPassword, setShowPassword] = useState(false)        // Hiển thị password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)  // Hiển thị confirm password
  const [errors, setErrors] = useState({})                       // Lỗi validation từng field
  const [loading, setLoading] = useState(false)                  // Đang gửi request
  const [apiError, setApiError] = useState('')                   // Lỗi từ API

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Xử lý khi người dùng thay đổi giá trị input
   * @param {Event} e - Event từ input
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      // Nếu là checkbox thì lấy checked, không thì lấy value
      [name]: type === 'checkbox' ? checked : value
    }))
    // Xóa lỗi khi user bắt đầu nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setApiError('')
  }

  /**
   * Validate form trước khi submit
   * @returns {boolean} Form hợp lệ hay không
   */
  const validate = () => {
    const newErrors = {}

    // Validate họ tên
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên'
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng'
    }

    // Validate mật khẩu
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    // Validate xác nhận mật khẩu
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp'
    }

    // Validate điều khoản sử dụng
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Bạn phải đồng ý với Điều khoản sử dụng'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Xử lý submit form đăng ký
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
      // Chuẩn bị dữ liệu gửi đi
      const registerData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
        // Có thể thêm accountType nếu backend support
      }

      // Gọi API đăng ký
      const response = await authApi.register(registerData)

      if (response.data?.success) {
        // Đăng ký thành công → chuyển đến trang Login với thông báo
        navigate('/login', {
          state: {
            message: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.'
          }
        })
      } else {
        setApiError(response.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      // Xử lý lỗi từ API
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.join(', ') ||
        'Đăng ký thất bại. Vui lòng thử lại.'
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
      title="Tạo tài khoản."
      subtitle="Đã có tài khoản?"
      linkText="Đăng nhập"
      linkTo="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ============================================== */}
        {/* DROPDOWN CHỌN LOẠI TÀI KHOẢN */}
        {/* ============================================== */}
        <div className="flex items-center justify-end mb-4">
          <div className="relative">
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="EMPLOYER">Nhà tuyển dụng</option>
              <option value="STUDENT">Ứng viên</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ============================================== */}
        {/* HỌ TÊN VÀ USERNAME (2 cột) */}
        {/* ============================================== */}
        <div className="grid grid-cols-2 gap-4">
          {/* Input họ tên */}
          <div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Họ và tên"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.fullName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
                }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>
          {/* Input username (tùy chọn) */}
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tên đăng nhập"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

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
        {/* INPUT MẬT KHẨU */}
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

        {/* ============================================== */}
        {/* INPUT XÁC NHẬN MẬT KHẨU */}
        {/* ============================================== */}
        <div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${errors.confirmPassword
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* ============================================== */}
        {/* CHECKBOX ĐIỀU KHOẢN SỬ DỤNG */}
        {/* ============================================== */}
        <div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Tôi đã đọc và đồng ý với{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                Điều khoản sử dụng
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
          )}
        </div>

        {/* Hiển thị lỗi từ API */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {apiError}
          </div>
        )}

        {/* ============================================== */}
        {/* NÚT ĐĂNG KÝ */}
        {/* ============================================== */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            'Đang tạo tài khoản...'
          ) : (
            <>
              Tạo tài khoản <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
