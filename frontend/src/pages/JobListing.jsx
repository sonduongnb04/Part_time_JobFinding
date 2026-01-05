/**
 * =============================================================================
 * JOB LISTING PAGE - Trang danh sách việc làm
 * =============================================================================
 * Trang hiển thị danh sách tất cả các tin tuyển dụng với khả năng tìm kiếm.
 * 
 * Tính năng:
 * - Tìm kiếm theo từ khóa (tên việc, công ty)
 * - Tìm kiếm theo địa điểm
 * - Hiển thị kết quả dạng danh sách
 * - Phân trang (pagination)
 * - Sidebar bộ lọc (đang phát triển)
 * 
 * URL Parameters:
 * - searchTerm: Từ khóa tìm kiếm
 * - location: Địa điểm
 * - page: Số trang
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, MapPin, Filter } from 'lucide-react'
import Header from '../components/Header'
import JobCard from '../components/JobCard'
import { jobPostsApi } from '../services/api'

/**
 * Component JobListing - Trang danh sách việc làm
 */
const JobListing = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    // ==========================================================================
    // STATE MANAGEMENT
    // ==========================================================================

    const [jobs, setJobs] = useState([])         // Danh sách việc làm
    const [loading, setLoading] = useState(true) // Đang tải dữ liệu
    const [error, setError] = useState(null)     // Lỗi nếu có
    const [pagination, setPagination] = useState({
        pageNumber: 1,      // Trang hiện tại
        pageSize: 10,       // Số item/trang
        totalCount: 0,      // Tổng số việc làm
        totalPages: 0       // Tổng số trang
    })

    // State cho form tìm kiếm (local state, chỉ update URL khi submit)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '')
    const [location, setLocation] = useState(searchParams.get('location') || '')

    // ==========================================================================
    // EFFECTS
    // ==========================================================================

    /**
     * Fetch danh sách việc làm khi URL params thay đổi
     */
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true)
            try {
                // Chuẩn bị params cho API
                const params = {
                    searchTerm: searchParams.get('searchTerm'),
                    location: searchParams.get('location'),
                    category: searchParams.get('category'),
                    pageNumber: parseInt(searchParams.get('page') || '1'),
                    pageSize: 10,
                    sortBy: 'createdAt',     // Sắp xếp theo ngày tạo
                    sortDescending: true     // Mới nhất lên trước
                }

                // Gọi API search
                const response = await jobPostsApi.search(params)

                // Backend trả về Result<PaginatedList<JobPostDto>>
                // response.data = { success: true, data: { items: [], totalCount, ... } }
                if (response.data.success) {
                    setJobs(response.data.data.items)
                    setPagination({
                        pageNumber: response.data.data.pageNumber,
                        pageSize: 10,
                        totalCount: response.data.data.totalCount,
                        totalPages: response.data.data.totalPages
                    })
                }
            } catch (err) {
                console.error('Không thể tải danh sách việc làm:', err)
                setError('Không thể tải danh sách việc làm. Vui lòng thử lại sau.')
            } finally {
                setLoading(false)
            }
        }

        fetchJobs()
    }, [searchParams])  // Chạy lại khi URL params thay đổi

    // ==========================================================================
    // EVENT HANDLERS
    // ==========================================================================

    /**
     * Xử lý submit form tìm kiếm
     * Cập nhật URL params để trigger fetch mới
     */
    const handleSearch = (e) => {
        e.preventDefault()
        const params = {}
        if (searchTerm) params.searchTerm = searchTerm
        if (location) params.location = location
        setSearchParams(params)  // Cập nhật URL → trigger useEffect
    }

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* ============================================== */}
            {/* THANH TÌM KIẾM - Sticky ở top */}
            {/* ============================================== */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <form onSubmit={handleSearch} className="flex gap-4">

                        {/* Input tìm theo từ khóa */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tên công việc, từ khóa, công ty..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Input tìm theo địa điểm (ẩn trên mobile) */}
                        <div className="flex-1 relative hidden md:block">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Thành phố, tỉnh, quốc gia"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Nút tìm kiếm */}
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Tìm kiếm
                        </button>
                    </form>
                </div>
            </div>

            {/* ============================================== */}
            {/* MAIN CONTENT */}
            {/* ============================================== */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">

                    {/* ============================================== */}
                    {/* SIDEBAR BỘ LỌC - Chỉ hiển thị trên desktop */}
                    {/* ============================================== */}


                    {/* ============================================== */}
                    {/* DANH SÁCH VIỆC LÀM */}
                    {/* ============================================== */}
                    <div className="flex-1">
                        {/* Header: Số kết quả và sắp xếp */}
                        <div className="mb-4 flex justify-between items-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                {loading ? 'Đang tìm kiếm...' : `${pagination.totalCount} việc làm`}
                            </h1>
                            <div className="text-sm text-gray-500">
                                Sắp xếp: <span className="font-medium text-gray-900">Mới nhất</span>
                            </div>
                        </div>

                        {/* Content: Loading / Error / Jobs / Empty */}
                        {loading ? (
                            // Loading skeleton
                            <div className="space-y-4">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                                            <div className="flex-1 space-y-3">
                                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            // Error state
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <p className="text-red-500 mb-2">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : jobs.length > 0 ? (
                            // Job list
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            // Empty state
                            <div className="text-center py-16 bg-white rounded-xl border border-dotted border-gray-300">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy việc làm</h3>
                                <p className="text-gray-500">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.</p>
                            </div>
                        )}

                        {/* TODO: Thêm pagination controls */}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default JobListing
