/**
 * =============================================================================
 * MY JOBS PAGE - Trang quản lý tin tuyển dụng của tôi
 * =============================================================================
 * Trang hiển thị danh sách các tin tuyển dụng mà nhà tuyển dụng đã đăng.
 * 
 * Tính năng:
 * - Xem danh sách tin tuyển dụng của công ty mình
 * - Xem số lượng ứng viên đã ứng tuyển
 * - Chỉnh sửa tin tuyển dụng
 * - Ẩn/hiện tin tuyển dụng
 * - Xóa tin tuyển dụng
 * - Xem danh sách ứng viên
 * 
 * Flow:
 * 1. Lấy thông tin công ty của user hiện tại
 * 2. Lấy danh sách tin tuyển dụng của công ty đó
 * =============================================================================
 */

import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import EmployersDashboardLayout from '../components/EmployersDashboardLayout'
import { jobPostsApi, companiesApi } from '../services/api'

/**
 * Component MyJobs - Trang quản lý tin tuyển dụng
 */
const MyJobs = () => {
  const location = useLocation()

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  const [jobs, setJobs] = useState([])         // Danh sách tin tuyển dụng
  const [loading, setLoading] = useState(true) // Đang tải
  const [message, setMessage] = useState('')   // Thông báo thành công/lỗi

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  /**
   * Hiển thị thông báo từ trang trước (nếu có)
   * VD: "Đăng tin thành công!"
   */
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message)
      // Tự động ẩn sau 5 giây
      setTimeout(() => setMessage(''), 5000)
    }
  }, [location])

  /**
   * Fetch danh sách tin tuyển dụng khi component mount
   */
  useEffect(() => {
    fetchJobs()
  }, [])

  // ==========================================================================
  // API FUNCTIONS
  // ==========================================================================

  /**
   * Fetch danh sách tin tuyển dụng của công ty
   * Flow: Lấy companyId từ API → Lấy jobs của company đó
   */
  const fetchJobs = async () => {
    try {
      // 1. Lấy thông tin công ty của user hiện tại
      const companyRes = await companiesApi.getMyCompany()
      if (companyRes.data?.success) {
        const companyId = companyRes.data.data.id

        // 2. Lấy danh sách tin của công ty
        const response = await jobPostsApi.getByCompany(companyId, 1, 100)
        if (response.data?.success) {
          setJobs(response.data.data?.items || [])
        }
      }
    } catch (error) {
      // Nếu lỗi 404 (chưa có công ty), jobs sẽ là []
      console.log('Không có công ty hoặc lỗi fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================================
  // ACTION HANDLERS
  // ==========================================================================

  /**
   * Xóa tin tuyển dụng
   * @param {number} jobId - ID tin cần xóa
   */
  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin này? Hành động này không thể hoàn tác.')) {
      try {
        await jobPostsApi.delete(jobId)
        setMessage('Đã xóa tin thành công')
        // Cập nhật local state (không cần fetch lại)
        setJobs(prev => prev.filter(job => job.id !== jobId))
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        console.error('Lỗi xóa tin:', error)
        alert('Không thể xóa tin tuyển dụng')
      }
    }
  }

  /**
   * Thay đổi trạng thái tin (Ẩn/Hiện)
   * @param {number} jobId - ID tin
   * @param {string} currentStatus - Trạng thái hiện tại
   */
  const handleToggleStatus = async (jobId, currentStatus) => {
    // Status enum: 0 = Active, 1 = Inactive, 2 = Expired, 3 = Closed
    const newStatus = currentStatus === 'Active' ? 1 : 0
    const actionText = currentStatus === 'Active' ? 'ẩn' : 'hiện'

    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tin này?`)) {
      try {
        await jobPostsApi.changeStatus(jobId, newStatus)
        setMessage(`Đã ${actionText} tin thành công`)
        // Cập nhật local state
        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, status: newStatus === 0 ? 'Active' : 'Inactive' }
            : job
        ))
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        console.error('Lỗi thay đổi trạng thái:', error)
        alert('Không thể thay đổi trạng thái tin')
      }
    }
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <EmployersDashboardLayout>
      <div>
        {/* Tiêu đề trang */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tin tuyển dụng của tôi</h1>

        {/* Thông báo thành công/lỗi */}
        {message && (
          <div className={`border px-4 py-3 rounded-lg mb-6 ${message.includes('success') || message.includes('thành công') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* ============================================== */}
        {/* CONTENT: Loading / Empty / Jobs list */}
        {/* ============================================== */}
        {loading ? (
          // Loading state
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Đang tải danh sách tin...</p>
          </div>
        ) : jobs.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              Bạn chưa đăng tin nào.{' '}
              <a href="/post-job" className="text-primary-600 hover:underline">
                Đăng tin đầu tiên
              </a>
            </p>
          </div>
        ) : (
          // Danh sách tin tuyển dụng
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    {/* Tên công việc */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    {/* Mô tả (cắt ngắn) */}
                    <p className="text-gray-600 mb-4">{job.description?.substring(0, 200)}...</p>
                    {/* Thông tin bổ sung */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span>{job.workType}</span>
                      {/* Số ứng viên */}
                      <span className="flex items-center gap-1 text-primary-600 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {job.applicationCount || 0} ứng viên
                      </span>
                      {/* Badge trạng thái */}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {job.status === 'Active' ? 'Đang hiển thị' : 'Đã ẩn'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ============================================== */}
                {/* CÁC NÚT HÀNH ĐỘNG */}
                {/* ============================================== */}
                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  {/* Xem ứng viên */}
                  <Link
                    to={`/jobs/${job.id}/applications`}
                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    Xem ứng viên
                  </Link>
                  {/* Sửa tin */}
                  <Link
                    to={`/edit-job/${job.id}`}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Sửa tin
                  </Link>
                  {/* Ẩn/Hiện tin */}
                  <button
                    onClick={() => handleToggleStatus(job.id, job.status)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${job.status === 'Active'
                      ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                      : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                  >
                    {job.status === 'Active' ? 'Ẩn tin' : 'Hiện tin'}
                  </button>
                  {/* Xóa tin */}
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Xóa tin
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EmployersDashboardLayout>
  )
}

export default MyJobs
