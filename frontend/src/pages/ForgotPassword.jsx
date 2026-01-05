/**
 * =============================================================================
 * FORGOT PASSWORD PAGE - Trang quên mật khẩu
 * =============================================================================
 * Trang cho phép người dùng yêu cầu reset mật khẩu qua email.
 * 
 * Flow:
 * 1. Người dùng nhập email
 * 2. Validate email
 * 3. Gọi API gửi link reset password
 * 4. Hiển thị thông báo thành công
 * 
 * States:
 * - Form nhập email
 * - Thông báo đã gửi email thành công
 * =============================================================================
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Mail } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'

/**
 * Component ForgotPassword - Trang quên mật khẩu
 */
const ForgotPassword = () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  const [email, setEmail] = useState('')           // Email người dùng
  const [errors, setErrors] = useState({})         // Lỗi validation
  const [loading, setLoading] = useState(false)    // Đang gửi request
  const [submitted, setSubmitted] = useState(false) // Đã gửi thành công
  const [apiError, setApiError] = useState('')     // Lỗi từ API

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Xử lý thay đổi input email
   */
  const handleChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors({})
    }
    setApiError('')
  }

  /**
   * Validate email trước khi submit
   */
  const validate = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không đúng định dạng'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Xử lý submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      // TODO: Implement forgot password API khi backend sẵn sàng
      // Hiện tại simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Giả lập thành công
      setSubmitted(true)
    } catch (error) {
      setApiError('Không thể gửi email reset. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================================
  // RENDER - TRẠNG THÁI ĐÃ GỬI THÀNH CÔNG
  // ==========================================================================

  if (submitted) {
    return (
      <AuthLayout
        title="Kiểm tra email của bạn."
        subtitle="Nhớ mật khẩu?"
        linkText="Đăng nhập"
        linkTo="/login"
      >
        <div className="space-y-6">
          {/* Thông báo thành công */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Đã gửi link reset!
            </h3>
            <p className="text-gray-600 text-sm">
              Chúng tôi đã gửi link reset mật khẩu đến <strong>{email}</strong>.
              Vui lòng kiểm tra email và làm theo hướng dẫn.
            </p>
          </div>

          {/* Hướng dẫn thêm */}
          <div className="text-center text-sm text-gray-600">
            <p>Không nhận được email? Kiểm tra thư mục spam hoặc</p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-primary-600 hover:text-primary-700 font-medium mt-1"
            >
              thử lại
            </button>
          </div>

          {/* Link quay lại Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </AuthLayout>
    )
  }

  // ==========================================================================
  // RENDER - FORM NHẬP EMAIL
  // ==========================================================================

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhớ mật khẩu?"
      linkText="Đăng nhập"
      linkTo="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hướng dẫn */}
        <p className="text-gray-600 text-sm mb-6">
          Nhập địa chỉ email của bạn và chúng tôi sẽ gửi link để reset mật khẩu.
        </p>

        {/* Input Email */}
        <div>
          <input
            type="email"
            name="email"
            value={email}
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

        {/* Hiển thị lỗi từ API */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {apiError}
          </div>
        )}

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            'Đang gửi...'
          ) : (
            <>
              Gửi link reset <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Link quay lại Login */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>
      </form>
    </AuthLayout>
  )
}

export default ForgotPassword
