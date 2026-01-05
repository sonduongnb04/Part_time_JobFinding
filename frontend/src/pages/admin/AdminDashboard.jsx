/**
 * =============================================================================
 * ADMIN DASHBOARD - Trang quản trị hệ thống
 * =============================================================================
 * Trang này dành cho Admin để quản lý toàn bộ hệ thống:
 * 
 * Chức năng chính:
 * 1. Tab "Yêu cầu đăng ký" - Duyệt/từ chối yêu cầu đăng ký công ty
 * 2. Tab "Quản lý tin tuyển dụng" - Duyệt/từ chối/xóa tin tuyển dụng
 * 3. Link đến "Log hệ thống" - Xem lịch sử hoạt động và log lỗi
 * 
 * Quyền truy cập: Chỉ dành cho người dùng có role ADMIN
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { companyRequestsApi, jobPostsApi, adminApi } from '../../services/api'
// Import icons từ Lucide
import {
    Check,        // Icon duyệt
    X,            // Icon từ chối
    Building2,    // Icon công ty
    User,         // Icon người dùng
    Calendar,     // Icon lịch
    Trash2,       // Icon xóa
    Briefcase,    // Icon việc làm
    CheckCircle,  // Icon duyệt (tròn)
    XCircle,      // Icon từ chối (tròn)
    History,      // Icon log/lịch sử
    Lock,         // Icon khóa
    Unlock        // Icon mở khóa
} from 'lucide-react'
import Header from '../../components/Header'

/**
 * Component AdminDashboard - Trang quản trị chính
 */
const AdminDashboard = () => {
    // ==========================================================================
    // STATE MANAGEMENT
    // ==========================================================================

    const [activeTab, setActiveTab] = useState('requests')  // Tab hiện tại: 'requests' hoặc 'jobs'
    const [requests, setRequests] = useState([])            // Danh sách yêu cầu đăng ký công ty
    const [jobPosts, setJobPosts] = useState([])           // Danh sách tin tuyển dụng
    const [users, setUsers] = useState([])                 // Danh sách người dùng
    const [loading, setLoading] = useState(true)           // Trạng thái loading
    const [error, setError] = useState(null)               // Lỗi nếu có
    const [actionLoading, setActionLoading] = useState(null) // ID của item đang thực hiện action

    // ==========================================================================
    // EFFECTS - Load dữ liệu khi chuyển tab
    // ==========================================================================

    useEffect(() => {
        if (activeTab === 'requests') {
            fetchPendingRequests()  // Tải yêu cầu đăng ký khi ở tab requests
        } else if (activeTab === 'jobs') {
            fetchJobPosts()         // Tải tin tuyển dụng khi ở tab jobs
        } else if (activeTab === 'users') {
            fetchUsers()            // Tải danh sách người dùng khi ở tab users
        }
    }, [activeTab])

    // ==========================================================================
    // API FUNCTIONS - Lấy dữ liệu từ server
    // ==========================================================================

    /**
     * Lấy danh sách yêu cầu đăng ký công ty đang chờ duyệt
     */
    const fetchPendingRequests = async () => {
        try {
            setLoading(true)
            const response = await companyRequestsApi.getPending()
            if (response.data.success) {
                setRequests(response.data.data.items)
            } else {
                setError('Không thể tải danh sách yêu cầu')
            }
        } catch (err) {
            console.error(err)
            setError('Lỗi khi tải yêu cầu đăng ký')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Lấy danh sách tất cả tin tuyển dụng
     */
    /**
     * Lấy danh sách tất cả tin tuyển dụng
     */
    const fetchJobPosts = async () => {
        try {
            setLoading(true)
            // WORKAROUND: Sử dụng JobPosts API (public) thay vì Admin API
            // vì backend hiện tại chưa có endpoint GET /api/Admin/jobs
            console.log('🔍 Fetching jobs from JobPosts API...')
            const response = await jobPostsApi.getAll(1, 100)
            console.log('📦 Response received:', response)
            console.log('📊 Response data:', response.data)
            
            if (response.data.success) {
                console.log('✅ Success! Jobs:', response.data.data.items)
                // Map response để phù hợp với UI (add companyName field)
                const jobs = response.data.data.items.map(job => ({
                    id: job.id,
                    title: job.title,
                    companyName: job.companyName,
                    location: job.location,
                    status: job.status,
                    createdAt: job.createdAt
                }))
                setJobPosts(jobs)
            } else {
                console.error('❌ API returned success=false:', response.data)
                setError('Không thể tải danh sách tin tuyển dụng')
            }
        } catch (err) {
            console.error('❌ Error fetching jobs:', err)
            console.error('Error response:', err.response)
            setError('Lỗi khi tải tin tuyển dụng: ' + (err.response?.data?.message || err.message))
        } finally {
            setLoading(false)
        }
    }

    /**
     * Lấy danh sách người dùng
     */
    const fetchUsers = async () => {
        try {
            setLoading(true)
            // Lấy 100 người dùng đầu tiên, tìm kiếm rỗng
            const response = await adminApi.getUsers('', 1, 100)
            if (response.data.success) {
                setUsers(response.data.data.items)
            } else {
                setError('Không thể tải danh sách người dùng')
            }
        } catch (err) {
            console.error(err)
            setError('Lỗi khi tải danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    // ==========================================================================
    // ACTION HANDLERS - Xử lý các hành động của admin
    // ==========================================================================

    // ==========================================================================
    // CONSTANTS
    // ==========================================================================
    const JOB_STATUS = {
        Draft: 0,
        Active: 1,
        Closed: 2,
        Expired: 3,
        Archived: 4,
        Pending: 5,
        Rejected: 6
    }

    // ==========================================================================
    // ACTION HANDLERS - Xử lý các hành động của admin
    // ==========================================================================

    /**
     * Phê duyệt yêu cầu đăng ký công ty
     * @param {number} requestId - ID yêu cầu cần duyệt
     */
    const handleApprove = async (requestId) => {
        try {
            setActionLoading(requestId)
            await companyRequestsApi.approve(requestId)
            fetchPendingRequests()  // Refresh danh sách
        } catch (err) {
            console.error(err)
            alert('Không thể phê duyệt yêu cầu')
        } finally {
            setActionLoading(null)
        }
    }

    /**
     * Từ chối yêu cầu đăng ký công ty
     * @param {number} requestId - ID yêu cầu cần từ chối
     */
    const handleReject = async (requestId) => {
        // Yêu cầu nhập lý do từ chối
        const reason = prompt('Vui lòng nhập lý do từ chối:')
        if (!reason) return  // Hủy nếu không nhập

        try {
            setActionLoading(requestId)
            await companyRequestsApi.reject(requestId, reason)
            fetchPendingRequests()  // Refresh danh sách
        } catch (err) {
            console.error(err)
            alert('Không thể từ chối yêu cầu')
        } finally {
            setActionLoading(null)
        }
    }

    /**
     * Xóa tin tuyển dụng
     * @param {number} jobId - ID tin cần xóa
     */
    const handleDeleteJob = async (jobId) => {
        // Xác nhận trước khi xóa
        if (!window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.')) {
            return
        }

        try {
            setActionLoading(jobId)
            await adminApi.deleteJob(jobId)
            fetchJobPosts()  // Refresh danh sách
        } catch (err) {
            console.error(err)
            alert('Không thể xóa tin tuyển dụng')
        } finally {
            setActionLoading(null)
        }
    }

    /**
     * Phê duyệt tin tuyển dụng
     * @param {number} jobId - ID tin cần duyệt
     */
    const handleApproveJob = async (jobId) => {
        try {
            setActionLoading(jobId)
            await adminApi.updateJobStatus(jobId, JOB_STATUS.Active)
            fetchJobPosts()  // Refresh danh sách
        } catch (err) {
            console.error(err)
            alert('Không thể duyệt tin tuyển dụng')
        } finally {
            setActionLoading(null)
        }
    }

    /**
     * Từ chối tin tuyển dụng
     * @param {number} jobId - ID tin cần từ chối
     */
    const handleRejectJob = async (jobId) => {
        // Yêu cầu nhập lý do từ chối
        const reason = prompt('Nhập lý do từ chối:')
        if (!reason) return

        try {
            setActionLoading(jobId)
            await adminApi.updateJobStatus(jobId, JOB_STATUS.Rejected)
            fetchJobPosts()  // Refresh danh sách
        } catch (err) {
            console.error(err)
            alert('Không thể từ chối tin tuyển dụng')
        } finally {
            setActionLoading(null)
        }
    }

    /**
     * Khóa tài khoản người dùng
     * @param {number} userId - ID người dùng cần khóa
     */
    const handleLockUser = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn khóa tài khoản này?')) {
            return
        }

        try {
            setActionLoading(userId)
            await adminApi.lockUser(userId)
            fetchUsers()  // Refresh danh sách
        } catch (err) {
            console.error(err)
            alert('Không thể khóa tài khoản')
        } finally {
            setActionLoading(null)
        }
    }

    /**
     * Mở khóa tài khoản người dùng
     * @param {number} userId - ID người dùng cần mở khóa
     */
    const handleUnlockUser = async (userId) => {
        try {
            setActionLoading(userId)
            await adminApi.unlockUser(userId)
            fetchUsers()  // Refresh danh sách
        } catch (err) {
            console.error(err)
            alert('Không thể mở khóa tài khoản')
        } finally {
            setActionLoading(null)
        }
    }

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ============================================== */}
                {/* HEADER - Tiêu đề trang */}
                {/* ============================================== */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
                    <p className="mt-2 text-gray-600">Quản lý hệ thống, duyệt yêu cầu đăng ký và kiểm duyệt nội dung</p>
                </div>

                {/* ============================================== */}
                {/* TABS - Các tab chuyển đổi chức năng */}
                {/* ============================================== */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    {/* Tab 1: Yêu cầu đăng ký công ty */}
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'requests'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Yêu cầu đăng ký ({requests.length})
                    </button>

                    {/* Tab 2: Quản lý tin tuyển dụng */}
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'jobs'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Quản lý tin tuyển dụng
                    </button>

                    {/* Tab 3: Quản lý người dùng */}
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'users'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Quản lý người dùng
                    </button>

                    {/* Link đến trang Log hệ thống */}
                    <Link
                        to="/admin/logs"
                        className="pb-3 px-4 text-sm font-medium transition-colors border-b-2 border-transparent text-gray-500 hover:text-gray-700 flex items-center"
                    >
                        <History className="h-4 w-4 mr-1" />
                        Log hệ thống
                    </Link>
                </div>

                {/* ============================================== */}
                {/* CONTENT - Nội dung theo tab */}
                {/* ============================================== */}
                {loading && (requests.length === 0 && jobPosts.length === 0 && users.length === 0) ? (
                    // Loading state
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    activeTab === 'requests' ? (
                        /* ========================================= */
                        /* TAB: YÊU CẦU ĐĂNG KÝ CÔNG TY */
                        /* ========================================= */
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">Yêu cầu đăng ký công ty</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Công ty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người yêu cầu</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {requests.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    Không có yêu cầu nào đang chờ duyệt
                                                </td>
                                            </tr>
                                        ) : (
                                            requests.map((request) => (
                                                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                                    {/* Cột: Thông tin công ty */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                                                {request.companyLogo ? (
                                                                    <img src={request.companyLogo} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <Building2 className="h-5 w-5 text-gray-500" />
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{request.companyName}</div>
                                                                <div className="text-sm text-gray-500 max-w-xs truncate">{request.companyDescription || 'Không có mô tả'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Cột: Người yêu cầu */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <User className="h-4 w-4 text-gray-400 mr-2" />
                                                            <div className="text-sm text-gray-900">{request.requesterName || 'Người dùng'}</div>
                                                        </div>
                                                    </td>
                                                    {/* Cột: Ngày gửi */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                            {new Date(request.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </td>
                                                    {/* Cột: Trạng thái */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                            Chờ duyệt
                                                        </span>
                                                    </td>
                                                    {/* Cột: Hành động */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        {/* Nút Duyệt */}
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={actionLoading === request.id}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                                                        >
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Duyệt
                                                        </button>
                                                        {/* Nút Từ chối */}
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={actionLoading === request.id}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                                        >
                                                            <X className="h-3 w-3 mr-1" />
                                                            Từ chối
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : activeTab === 'jobs' ? (
                        /* ========================================= */
                        /* TAB: QUẢN LÝ TIN TUYỂN DỤNG */
                        /* ========================================= */
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">Quản lý tin tuyển dụng</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Công ty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa điểm</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {jobPosts.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    Không có tin tuyển dụng nào
                                                </td>
                                            </tr>
                                        ) : (
                                            jobPosts.map((job) => (
                                                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                                    {/* Cột: Tiêu đề tin */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                                                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                                        </div>
                                                    </td>
                                                    {/* Cột: Công ty */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{job.companyName}</div>
                                                    </td>
                                                    {/* Cột: Địa điểm */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{job.location}</div>
                                                    </td>
                                                    {/* Cột: Trạng thái với màu sắc tương ứng */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === JOB_STATUS.Active ? 'bg-green-100 text-green-800' :
                                                            job.status === JOB_STATUS.Rejected ? 'bg-red-100 text-red-800' :
                                                                (job.status === JOB_STATUS.Pending || job.status === JOB_STATUS.Draft) ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {job.status === JOB_STATUS.Active ? 'Đã duyệt' :
                                                                job.status === JOB_STATUS.Rejected ? 'Từ chối' :
                                                                    (job.status === JOB_STATUS.Pending || job.status === JOB_STATUS.Draft) ? 'Chờ duyệt' :
                                                                        job.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                    {/* Cột: Ngày đăng */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </td>
                                                    {/* Cột: Hành động */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        {/* Nút Duyệt - chỉ hiển thị nếu chưa duyệt */}
                                                        {job.status !== JOB_STATUS.Active && (
                                                            <button
                                                                onClick={() => handleApproveJob(job.id)}
                                                                disabled={actionLoading === job.id}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                                                            >
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Duyệt
                                                            </button>
                                                        )}
                                                        {/* Nút Từ chối - chỉ hiển thị nếu đang chờ duyệt */}
                                                        {job.status !== JOB_STATUS.Rejected && job.status !== JOB_STATUS.Active && (
                                                            <button
                                                                onClick={() => handleRejectJob(job.id)}
                                                                disabled={actionLoading === job.id}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                                                            >
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Từ chối
                                                            </button>
                                                        )}
                                                        {/* Nút Xóa - luôn hiển thị */}
                                                        <button
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            disabled={actionLoading === job.id}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* ========================================= */
                        /* TAB: QUẢN LÝ NGƯỜI DÙNG */
                        /* ========================================= */
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">Quản lý người dùng</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    Không có người dùng nào
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    {/* Cột: Họ tên */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <User className="h-5 w-5 text-gray-400 mr-3" />
                                                            <div className="text-sm font-medium text-gray-900">{user.fullName || 'Chưa cập nhật'}</div>
                                                        </div>
                                                    </td>
                                                    {/* Cột: Email */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{user.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {/* Support both camelCase and PascalCase for Roles */}
                                                        {(user.roles || user.Roles || []).length > 0 ? (
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(user.roles || user.Roles).includes('ADMIN') ? 'bg-purple-100 text-purple-800' :
                                                                (user.roles || user.Roles).includes('EMPLOYER') ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                {(user.roles || user.Roles).join(', ')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-500 italic">Chưa cập nhật</span>
                                                        )}
                                                    </td>
                                                    {/* Cột: Trạng thái */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                                        </span>
                                                    </td>
                                                    {/* Cột: Hành động */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {/* Nút Khóa/Mở Khóa - Không cho phép khóa chính mình */}
                                                        {/* TODO: Check if userId !== currentUserId */}
                                                        <button
                                                            onClick={() => user.isActive ? handleLockUser(user.id) : handleUnlockUser(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${user.isActive
                                                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' // Nút khóa
                                                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500' // Nút mở khóa
                                                                }`}
                                                        >
                                                            {user.isActive ? (
                                                                <>
                                                                    <Lock className="h-3 w-3 mr-1" />
                                                                    Khóa
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Unlock className="h-3 w-3 mr-1" />
                                                                    Mở khóa
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
