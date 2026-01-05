/**
 * =============================================================================
 * POST JOB PAGE - Trang đăng/sửa tin tuyển dụng
 * =============================================================================
 * Trang cho phép nhà tuyển dụng (Employer) đăng mới hoặc chỉnh sửa tin tuyển dụng.
 * 
 * Modes:
 * - Create mode: Đăng tin mới (URL: /post-job)
 * - Edit mode: Sửa tin đã có (URL: /edit-job/:jobId)
 * 
 * Form fields:
 * - Tên công việc (bắt buộc)
 * - Mức lương (min/max)
 * - Loại công việc (Full-time, Part-time, ...)
 * - Địa điểm
 * - Ngày hết hạn
 * - Cấp độ công việc
 * - Mô tả công việc (bắt buộc)
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Bold, Italic, Underline, Strikethrough, Link as LinkIcon, List, ListOrdered, ChevronDown } from 'lucide-react'
import EmployersDashboardLayout from '../components/EmployersDashboardLayout'
import { jobPostsApi } from '../services/api'

/**
 * Component PostJob - Trang đăng/sửa tin tuyển dụng
 */
const PostJob = () => {
  const navigate = useNavigate()
  const { jobId } = useParams()   // Lấy jobId từ URL params (nếu có)
  const isEditMode = !!jobId      // true nếu đang ở chế độ sửa

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Dữ liệu form
  const [formData, setFormData] = useState({
    title: '',           // Tên công việc
    description: '',     // Mô tả công việc
    salaryMin: '',       // Lương tối thiểu
    salaryMax: '',       // Lương tối đa
    jobType: '',         // Loại công việc
    location: '',        // Địa điểm
    expirationDate: '',  // Ngày hết hạn (DD/MM/YYYY)
    jobLevel: '',        // Cấp độ công việc
    category: '',        // Danh mục công việc (Mới)
  })
  const [errors, setErrors] = useState({})       // Lỗi validation
  const [loading, setLoading] = useState(false)  // Đang gửi request
  const [apiError, setApiError] = useState('')   // Lỗi từ API

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  /**
   * Nếu đang ở chế độ sửa, fetch thông tin tin tuyển dụng
   */
  useEffect(() => {
    if (isEditMode) {
      const fetchJobDetails = async () => {
        try {
          setLoading(true)
          const response = await jobPostsApi.getById(jobId)
          if (response.data?.success) {
            const job = response.data.data

            // Format date từ YYYY-MM-DDTHH:mm:ss sang DD/MM/YYYY
            let formattedDate = ''
            if (job.applicationDeadline) {
              const dateObj = new Date(job.applicationDeadline)
              const day = dateObj.getDate().toString().padStart(2, '0')
              const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
              const year = dateObj.getFullYear()
              formattedDate = `${day}/${month}/${year}`
            }

            // Điền dữ liệu vào form
            setFormData({
              title: job.title || '',
              description: job.description || '',
              salaryMin: job.salaryMin ? job.salaryMin.toString() : '',
              salaryMax: job.salaryMax ? job.salaryMax.toString() : '',
              jobType: job.workType || '',
              location: job.location || '',
              expirationDate: formattedDate,
              jobLevel: job.jobLevel || job.category || '', // Prefer new JobLevel, fallback to old Category logic
              category: job.category || '', // New category field
            })
          }
        } catch (error) {
          console.error('Không thể tải thông tin tin tuyển dụng:', error)
          setApiError('Không thể tải thông tin tin tuyển dụng')
        } finally {
          setLoading(false)
        }
      }
      fetchJobDetails()
    }
  }, [isEditMode, jobId])

  // ==========================================================================
  // CONSTANTS - Các options cho dropdown
  // ==========================================================================

  // Danh mục công việc
  const categories = [
    'Graphics & Design',
    'Code & Programing',
    'Digital Marketing',
    'Video & Animation',
    'Music & Audio',
    'Account & Finance',
    'Health & Care',
    'Data & Science',
  ]

  // Loại công việc
  const jobTypes = [
    'Full-time',
    'Part-time',
    'Freelance',
    'Internship',
    'Contract',
  ]

  // Cấp độ công việc
  const jobLevels = [
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Executive',
  ]

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  /**
   * Xử lý thay đổi giá trị input thông thường
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Xóa lỗi khi user nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setApiError('')
  }

  /**
   * Xử lý thay đổi description (textarea)
   */
  const handleDescriptionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      description: e.target.value
    }))
  }

  /**
   * Format date từ DD/MM/YYYY sang YYYY-MM-DD để gửi API
   */
  const formatDate = (dateString) => {
    if (!dateString) return null
    const parts = dateString.split('/')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = parts[2]
      return `${year}-${month}-${day}`
    }
    return dateString
  }

  /**
   * Xử lý nhập ngày với auto-format DD/MM/YYYY
   */
  const handleDateInput = (e) => {
    let value = e.target.value.replace(/\D/g, '') // Chỉ giữ số

    // Tự động thêm dấu /
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2)
    }
    if (value.length > 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9)
    }

    setFormData(prev => ({
      ...prev,
      expirationDate: value
    }))
  }

  /**
   * Validate form trước khi submit
   */
  const validate = () => {
    const newErrors = {}

    // Validate tên công việc
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên công việc'
    }

    // Validate mô tả
    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả công việc'
    }

    // Validate lương (min <= max)
    if (formData.salaryMin && formData.salaryMax) {
      const min = parseFloat(formData.salaryMin)
      const max = parseFloat(formData.salaryMax)
      if (min > max) {
        newErrors.salaryMax = 'Lương tối đa phải lớn hơn lương tối thiểu'
      }
    }

    // Validate định dạng ngày
    if (formData.expirationDate) {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
      if (!dateRegex.test(formData.expirationDate)) {
        newErrors.expirationDate = 'Ngày phải có định dạng DD/MM/YYYY'
      }
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

    // Validate trước khi gửi
    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      // Chuẩn bị dữ liệu gửi API
      const jobData = {
        title: formData.title,
        description: formData.description,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        workType: formData.jobType || null,
        location: formData.location || null,
        ApplicationDeadline: formData.expirationDate ? formatDate(formData.expirationDate) : null,
        applicationDeadline: formData.expirationDate ? formatDate(formData.expirationDate) : null,
        jobLevel: formData.jobLevel || null,
        category: formData.category || null,
        salaryPeriod: 'Monthly',  // Mặc định: lương theo tháng
        requiredSkills: [],
        shifts: [],
      }

      let response;
      if (isEditMode) {
        // Cập nhật tin hiện có
        response = await jobPostsApi.update(jobId, jobData)
      } else {
        // Tạo tin mới
        response = await jobPostsApi.create(jobData)
      }

      if (response.data?.success) {
        // Thành công → chuyển đến trang My Jobs
        navigate('/my-jobs', {
          state: { message: isEditMode ? 'Đã cập nhật tin thành công!' : 'Đã đăng tin thành công!' }
        })
      } else {
        setApiError(response.data?.message || (isEditMode ? 'Không thể cập nhật tin' : 'Không thể đăng tin'))
      }
    } catch (error) {
      console.error(error)
      let errorMessage = isEditMode ? 'Không thể cập nhật tin' : 'Không thể đăng tin';

      // Xử lý lỗi từ API
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.title) {
            errorMessage = error.response.data.title;
          }

          // Nối thêm validation errors nếu có
          if (error.response.data.errors) {
            const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
            errorMessage += `: ${validationErrors}`;
          }
        } else {
          errorMessage = `Lỗi ${error.response.status}: ${error.response.statusText}`;
        }
      }

      setApiError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Format currency - chỉ cho phép số
   */
  const formatCurrency = (value) => {
    return value.replace(/\D/g, '')
  }

  /**
   * Xử lý thay đổi input lương
   */
  const handleSalaryChange = (e) => {
    const { name, value } = e.target
    const formatted = formatCurrency(value)
    setFormData(prev => ({
      ...prev,
      [name]: formatted
    }))
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <EmployersDashboardLayout>
      <div className="max-w-4xl">
        {/* Tiêu đề trang */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditMode ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ============================================== */}
          {/* TÊN CÔNG VIỆC */}
          {/* ============================================== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên công việc
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tên công việc, vị trí tuyển dụng..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-primary-500'
                }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* ============================================== */}
          {/* MỨC LƯƠNG */}
          {/* ============================================== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Mức lương
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Lương tối thiểu */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Lương tối thiểu</label>
                <div className="relative">
                  <input
                    type="text"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleSalaryChange}
                    placeholder="Lương tối thiểu..."
                    className={`w-full px-4 py-3 pr-16 border rounded-lg focus:outline-none focus:ring-2 ${errors.salaryMin
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                      }`}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    VND
                  </span>
                </div>
              </div>
              {/* Lương tối đa */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Lương tối đa</label>
                <div className="relative">
                  <input
                    type="text"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleSalaryChange}
                    placeholder="Lương tối đa..."
                    className={`w-full px-4 py-3 pr-16 border rounded-lg focus:outline-none focus:ring-2 ${errors.salaryMax
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                      }`}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    VND
                  </span>
                </div>
                {errors.salaryMax && (
                  <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>
                )}
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* THÔNG TIN BỔ SUNG */}
          {/* ============================================== */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h3>
            <div className="grid grid-cols-2 gap-4">

              {/* Danh mục công việc (Mới) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer pr-10"
                  >
                    <option value="">Chọn...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Loại công việc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại công việc
                </label>
                <div className="relative">
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer pr-10"
                  >
                    <option value="">Chọn...</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Địa điểm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Địa điểm làm việc"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Ngày hết hạn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày hết hạn
                </label>
                <input
                  type="text"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleDateInput}
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.expirationDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                    }`}
                />
                {errors.expirationDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expirationDate}</p>
                )}
              </div>

              {/* Cấp độ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp độ
                </label>
                <div className="relative">
                  <select
                    name="jobLevel"
                    value={formData.jobLevel}
                    onChange={handleChange}
                    className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer pr-10"
                  >
                    <option value="">Chọn...</option>
                    {jobLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* MÔ TẢ CÔNG VIỆC */}
          {/* ============================================== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả công việc
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Toolbar text editor */}
              <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex items-center space-x-2">
                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="In đậm">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="In nghiêng">
                  <Italic className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Gạch chân">
                  <Underline className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Gạch ngang">
                  <Strikethrough className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Chèn link">
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Danh sách">
                  <List className="w-4 h-4" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-200 rounded" title="Danh sách số">
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea mô tả */}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Nhập mô tả chi tiết về công việc..."
                rows={10}
                className={`w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 resize-none ${errors.description ? 'bg-red-50' : ''
                  }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Hiển thị lỗi từ API */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          {/* ============================================== */}
          {/* NÚT SUBMIT */}
          {/* ============================================== */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                isEditMode ? 'Đang cập nhật...' : 'Đang đăng...'
              ) : (
                <>
                  {isEditMode ? 'Cập nhật tin' : 'Đăng tin'} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </EmployersDashboardLayout>
  )
}

export default PostJob
