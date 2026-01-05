/**
 * =============================================================================
 * SYSTEM LOGS PAGE - Trang xem log hệ thống (Admin)
 * =============================================================================
 * Trang dành cho Admin để xem lịch sử hoạt động và log lỗi của hệ thống.
 * 
 * Tính năng:
 * - 2 tab: Lịch sử hoạt động (Activity) và Log lỗi (Errors)
 * - Bộ lọc theo User ID, mức độ lỗi, khoảng thời gian
 * - Phân trang
 * - Xem chi tiết stack trace của lỗi
 * 
 * Dữ liệu hiển thị:
 * - Activity Logs: Ai làm gì, khi nào, với đối tượng nào
 * - Error Logs: Lỗi gì xảy ra, mức độ, nguồn gốc, chi tiết
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { logsApi } from '../../services/api'
import { Activity, AlertTriangle, Calendar, User, Filter, RefreshCw, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import Header from '../../components/Header'

/**
 * Component SystemLogs - Trang xem log hệ thống
 */
const SystemLogs = () => {
    // ==========================================================================
    // STATE MANAGEMENT
    // ==========================================================================

    const [activeTab, setActiveTab] = useState('activities') // Tab: 'activities' hoặc 'errors'
    const [activityLogs, setActivityLogs] = useState([])     // Danh sách activity logs
    const [errorLogs, setErrorLogs] = useState([])           // Danh sách error logs
    const [loading, setLoading] = useState(true)             // Đang tải
    const [error, setError] = useState(null)                 // Lỗi

    // State cho bộ lọc
    const [userId, setUserId] = useState('')        // Lọc theo User ID
    const [startDate, setStartDate] = useState('')  // Lọc từ ngày
    const [endDate, setEndDate] = useState('')      // Lọc đến ngày
    const [errorLevel, setErrorLevel] = useState('') // Lọc theo mức độ lỗi

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 20

    // ==========================================================================
    // EFFECTS
    // ==========================================================================

    /**
     * Fetch logs khi tab hoặc trang thay đổi
     */
    useEffect(() => {
        fetchLogs()
    }, [activeTab, currentPage])

    // ==========================================================================
    // API FUNCTIONS
    // ==========================================================================

    /**
     * Fetch logs từ API
     * Tùy theo tab đang active sẽ fetch activity hoặc error logs
     */
    const fetchLogs = async () => {
        try {
            setLoading(true)
            setError(null)

            if (activeTab === 'activities') {
                // Fetch activity logs
                const response = await logsApi.getActivityLogs(
                    userId || undefined,
                    startDate || undefined,
                    endDate || undefined,
                    currentPage,
                    pageSize
                )
                if (response.data.success) {
                    // Support both 'items' (new backend) and 'logs' (old backend)
                    setActivityLogs(response.data.data.items || response.data.data.logs || [])
                    setTotalPages(response.data.data.totalPages || 1)
                }
            } else {
                // Fetch error logs
                const response = await logsApi.getErrorLogs(
                    errorLevel || undefined,
                    startDate || undefined,
                    endDate || undefined,
                    currentPage,
                    pageSize
                )
                if (response.data.success) {
                    // Support both 'items' (new backend) and 'logs' (old backend)
                    setErrorLogs(response.data.data.items || response.data.data.logs || [])
                    setTotalPages(response.data.data.totalPages || 1)
                }
            }
        } catch (err) {
            console.error(err)
            setError('Không thể tải log. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    // ==========================================================================
    // EVENT HANDLERS
    // ==========================================================================

    /**
     * Xử lý khi click nút Lọc
     */
    const handleFilter = () => {
        setCurrentPage(1)  // Reset về trang 1
        fetchLogs()
    }

    /**
     * Xử lý refresh dữ liệu
     */
    const handleRefresh = () => {
        fetchLogs()
    }

    // ==========================================================================
    // HELPER FUNCTIONS
    // ==========================================================================

    /**
     * Format ngày giờ theo locale Việt Nam
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('vi-VN')
    }

    /**
     * Lấy class CSS cho badge mức độ lỗi
     */
    const getErrorLevelBadge = (level) => {
        const styles = {
            'Error': 'bg-red-100 text-red-800',
            'Warning': 'bg-yellow-100 text-yellow-800',
            'Info': 'bg-blue-100 text-blue-800',
            'Debug': 'bg-gray-100 text-gray-800',
        }
        return styles[level] || 'bg-gray-100 text-gray-800'
    }

    /**
     * Helper mapping action từ HTTP Method (cho legacy backend)
     */
    const mapAction = (log) => {
        if (log.action) return log.action; // Nếu backend đã map sẵn

        const method = log.httpMethod?.toUpperCase();
        const path = log.path?.toLowerCase();

        if (path?.includes('/login')) return 'Login';
        if (path?.includes('/logout')) return 'Logout';
        if (path?.includes('/approve')) return 'Approve';
        if (path?.includes('/reject')) return 'Reject';

        const map = {
            'POST': 'Create',
            'PUT': 'Update',
            'PATCH': 'Update',
            'DELETE': 'Delete',
            'GET': 'View'
        };
        return map[method] || method || 'Unknown';
    }

    /**
     * Helper mapping entity type (cho legacy backend)
     */
    const mapEntityType = (log) => {
        if (log.entityType) return log.entityType; // Nếu backend đã map sẵn

        const path = log.path?.toLowerCase();
        if (!path) return 'System';

        if (path.includes('auth')) return 'Auth';
        if (path.includes('jobposts')) return 'Job Post';
        if (path.includes('companies')) return 'Company';
        if (path.includes('profiles')) return 'Profile';
        if (path.includes('applications')) return 'Application';
        if (path.includes('users')) return 'User';

        return 'System';
    }

    /**
     * Lấy class CSS cho badge loại hành động
     */
    const getActionBadge = (action) => {
        const styles = {
            'Create': 'bg-green-100 text-green-800',
            'Update': 'bg-blue-100 text-blue-800',
            'Delete': 'bg-red-100 text-red-800',
            'Login': 'bg-purple-100 text-purple-800',
            'Logout': 'bg-gray-100 text-gray-800',
            'Approve': 'bg-emerald-100 text-emerald-800',
            'Reject': 'bg-orange-100 text-orange-800',
            'View': 'bg-gray-100 text-gray-600'
        }
        return styles[action] || 'bg-gray-100 text-gray-800'
    }

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ============================================== */}
                {/* PAGE HEADER */}
                {/* ============================================== */}
                <div className="mb-8">
                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Quay về Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Log Hệ Thống</h1>
                    <p className="mt-2 text-gray-600">Xem lịch sử hoạt động và lỗi hệ thống</p>
                </div>

                {/* ============================================== */}
                {/* TABS - Chuyển đổi giữa Activity và Error logs */}
                {/* ============================================== */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => { setActiveTab('activities'); setCurrentPage(1); }}
                        className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center ${activeTab === 'activities'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Lịch sử hoạt động
                    </button>
                    <button
                        onClick={() => { setActiveTab('errors'); setCurrentPage(1); }}
                        className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center ${activeTab === 'errors'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Log lỗi
                    </button>
                </div>

                {/* ============================================== */}
                {/* BỘ LỌC */}
                {/* ============================================== */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Filter className="h-4 w-4" />
                            <span className="font-medium">Bộ lọc:</span>
                        </div>

                        {/* Filter theo User ID (chỉ hiển thị cho tab activities) */}
                        {activeTab === 'activities' && (
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs text-gray-500 mb-1">User ID</label>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="Nhập User ID..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Filter theo mức độ lỗi (chỉ hiển thị cho tab errors) */}
                        {activeTab === 'errors' && (
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs text-gray-500 mb-1">Mức độ</label>
                                <select
                                    value={errorLevel}
                                    onChange={(e) => setErrorLevel(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Error">Error</option>
                                    <option value="Warning">Warning</option>
                                    <option value="Info">Info</option>
                                    <option value="Debug">Debug</option>
                                </select>
                            </div>
                        )}

                        {/* Filter từ ngày */}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter đến ngày */}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Nút Lọc và Refresh */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                            >
                                Lọc
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Làm mới"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ============================================== */}
                {/* NỘI DUNG CHÍNH */}
                {/* ============================================== */}
                {loading ? (
                    // Loading state
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : error ? (
                    // Error state
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : activeTab === 'activities' ? (
                    /* ============================================== */
                    /* BẢNG ACTIVITY LOGS */
                    /* ============================================== */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Lịch sử hoạt động</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đối tượng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {activityLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                Không có dữ liệu log hoạt động
                                            </td>
                                        </tr>
                                    ) : (
                                        activityLogs.map((log, index) => (
                                            <tr key={log.id || index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                        {formatDate(log.createdAt || log.timestamp)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-900">
                                                            {log.userName || (log.user ? (log.user.fullName || log.user.email) : `User #${log.userId}`)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadge(mapAction(log))}`}>
                                                        {mapAction(log)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">{mapEntityType(log)}</span>
                                                    {log.entityId && (
                                                        <span className="text-xs text-gray-400 ml-1">#{log.entityId}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-500 max-w-xs truncate block">
                                                        {log.details || log.additionalData || `${log.httpMethod} ${log.path}`}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* ============================================== */
                    /* BẢNG ERROR LOGS */
                    /* ============================================== */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Log lỗi hệ thống</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mức độ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nguồn</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông báo lỗi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {errorLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                Không có log lỗi
                                            </td>
                                        </tr>
                                    ) : (
                                        errorLogs.map((log, index) => (
                                            <tr key={log.id || index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                        {formatDate(log.createdAt || log.timestamp)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getErrorLevelBadge(log.level)}`}>
                                                        {log.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">{log.source || 'Unknown'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-md">
                                                        <p className="font-medium truncate">{log.message}</p>
                                                        {/* Collapsible stack trace */}
                                                        {log.stackTrace && (
                                                            <details className="mt-1">
                                                                <summary className="text-xs text-primary-600 cursor-pointer hover:text-primary-700">
                                                                    Xem Stack Trace
                                                                </summary>
                                                                <pre className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                                                                    {log.stackTrace}
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ============================================== */}
                {/* PHÂN TRANG */}
                {/* ============================================== */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-gray-600">
                            Trang {currentPage} / {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SystemLogs
