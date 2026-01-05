/**
 * =============================================================================
 * EMPLOYER PROFILE PAGE - Trang hồ sơ công ty
 * =============================================================================
 * Trang cho phép nhà tuyển dụng tạo mới hoặc cập nhật thông tin công ty.
 * 
 * Tính năng:
 * - Tạo mới hồ sơ công ty (nếu chưa có)
 * - Cập nhật thông tin công ty hiện có
 * - Upload/cập nhật logo công ty (qua URL)
 * 
 * Form fields:
 * - Tên công ty (bắt buộc)
 * - Logo URL
 * - Website
 * - Ngành nghề
 * - Số lượng nhân viên
 * - Mã số thuế
 * - Địa chỉ
 * - Mô tả công ty
 * 
 * Flow:
 * 1. Kiểm tra xem user đã có công ty chưa (GET /Companies/my-company)
 * 2. Nếu có → hiển thị form với dữ liệu hiện tại → Update
 * 3. Nếu chưa có → hiển thị form trống → Create
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import EmployersDashboardLayout from '../components/EmployersDashboardLayout'
import { companiesApi } from '../services/api'
import { Building2, Globe, MapPin, Save, Upload } from 'lucide-react'

/**
 * Component EmployerProfile - Trang hồ sơ công ty
 */
const EmployerProfile = () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  const [loading, setLoading] = useState(true)     // Đang tải dữ liệu
  const [submitting, setSubmitting] = useState(false) // Đang gửi form
  const [companyId, setCompanyId] = useState(null) // ID công ty (null nếu chưa có)

  // Dữ liệu form
  const [formData, setFormData] = useState({
    name: '',           // Tên công ty
    description: '',    // Mô tả
    website: '',        // Website
    address: '',        // Địa chỉ
    logoUrl: '',        // URL logo
    industry: '',       // Ngành nghề
    employeeCount: '',  // Số nhân viên
    taxCode: ''         // Mã số thuế
  })
  const [error, setError] = useState(null)            // Lỗi
  const [successMessage, setSuccessMessage] = useState('') // Thông báo thành công

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  /**
   * Fetch thông tin công ty khi component mount
   */
  useEffect(() => {
    fetchCompanyProfile()
  }, [])

  // ==========================================================================
  // API FUNCTIONS
  // ==========================================================================

  /**
   * Fetch thông tin công ty của user hiện tại
   */
  const fetchCompanyProfile = async () => {
    try {
      setLoading(true)
      const response = await companiesApi.getMyCompany()
      if (response.data.success && response.data.data) {
        const company = response.data.data
        setCompanyId(company.id)
        // Điền dữ liệu vào form
        setFormData({
          name: company.name || '',
          description: company.description || '',
          website: company.website || '',
          address: company.address || '',
          logoUrl: company.logoUrl || '',
          industry: company.industry || '',
          employeeCount: company.employeeCount || '',
          taxCode: company.taxCode || ''
        })
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // 404 = chưa có công ty → cho phép tạo mới
        setCompanyId(null)
      } else {
        console.error(err)
        setError('Không thể tải thông tin công ty')
      }
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Xử lý thay đổi input
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Xử lý submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMessage('')

    try {
      // Chuẩn bị dữ liệu gửi API
      const apiData = {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        address: formData.address,
        logoUrl: formData.logoUrl,
        industry: formData.industry,
        taxCode: formData.taxCode || null,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : null,
        foundedYear: null
      }

      if (companyId) {
        // Cập nhật công ty hiện có
        await companiesApi.update(companyId, apiData)
        setSuccessMessage('Đã cập nhật thông tin công ty!')
      } else {
        // Tạo công ty mới
        await companiesApi.create(apiData)
        setSuccessMessage('Đã tạo hồ sơ công ty! Vui lòng chờ Admin phê duyệt.')
        fetchCompanyProfile() // Refresh để lấy companyId mới
      }
    } catch (err) {
      console.error(err)

      let errorMessage = 'Không thể lưu thông tin';

      // Xử lý lỗi từ backend
      if (err.response) {
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.title) {
            errorMessage = err.response.data.title;
          }

          // Nối validation errors nếu có
          if (err.response.data.errors) {
            const validationErrors = Object.values(err.response.data.errors).flat().join(', ');
            errorMessage += `: ${validationErrors}`;
          }
        } else {
          errorMessage = `Lỗi ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // ==========================================================================
  // RENDER - LOADING STATE
  // ==========================================================================

  if (loading) {
    return (
      <EmployersDashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </EmployersDashboardLayout>
    )
  }

  // ==========================================================================
  // RENDER - MAIN CONTENT
  // ==========================================================================

  return (
    <EmployersDashboardLayout>
      <div className="max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ công ty</h1>
          <p className="mt-2 text-gray-600">
            {companyId
              ? 'Quản lý thông tin và thương hiệu công ty của bạn.'
              : 'Tạo hồ sơ công ty để bắt đầu đăng tin tuyển dụng.'}
          </p>
        </div>

        {/* Hiển thị lỗi */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg break-words">
            {error}
          </div>
        )}

        {/* Hiển thị thông báo thành công */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* ============================================== */}
        {/* FORM HỒ SƠ CÔNG TY */}
        {/* ============================================== */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">

            {/* ============================================== */}
            {/* SECTION: LOGO */}
            {/* ============================================== */}
            <div className="flex items-start space-x-8">
              {/* Preview logo */}
              <div className="flex-shrink-0">
                <div className="h-32 w-32 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-12 w-12 text-gray-400" />
                  )}
                </div>
              </div>
              {/* Input URL logo */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Logo công ty</label>
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Nhập đường dẫn trực tiếp đến hình ảnh logo.
                </p>
              </div>
            </div>

            {/* ============================================== */}
            {/* SECTION: THÔNG TIN CƠ BẢN */}
            {/* ============================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Tên công ty */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên công ty *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="VD: Công ty ABC"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Ngành nghề */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngành nghề</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="VD: Công nghệ"
                />
              </div>

              {/* Số nhân viên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng nhân viên</label>
                <input
                  type="number"
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="VD: 50"
                  min="1"
                />
              </div>

              {/* Mã số thuế */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã số thuế</label>
                <input
                  type="text"
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="VD: 0101234567"
                />
              </div>

              {/* Địa chỉ */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ trụ sở</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="VD: 123 Nguyễn Văn A, Quận 1, TP.HCM"
                  />
                </div>
              </div>

              {/* Mô tả công ty */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu công ty</label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Giới thiệu về văn hóa công ty, sứ mệnh và giá trị cốt lõi..."
                />
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* FOOTER: NÚT SUBMIT */}
          {/* ============================================== */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors flex items-center"
            >
              {submitting ? 'Đang lưu...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </EmployersDashboardLayout>
  )
}

/**
 * Icon Check - Hiển thị dấu tick
 */
function Check({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default EmployerProfile
