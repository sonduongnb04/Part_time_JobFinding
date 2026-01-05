/**
 * =============================================================================
 * JOB DETAIL PAGE - Trang chi tiết việc làm
 * =============================================================================
 * Trang hiển thị đầy đủ thông tin của một tin tuyển dụng cụ thể.
 * 
 * Tính năng:
 * - Hiển thị chi tiết (Mô tả, Yêu cầu, Quyền lợi)
 * - Thông tin công ty
 * - Nút ứng tuyển (Apply)
 * - Gợi ý việc làm liên quan (Future improvement)
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, DollarSign, Clock, Calendar, Briefcase, Building2, ChevronLeft } from 'lucide-react'
import Header from '../components/Header'
import { jobPostsApi } from '../services/api'

const JobDetail = () => {
    const { jobId } = useParams() // Lấy ID từ URL

    // ==========================================================================
    // STATE MANAGEMENT
    // ==========================================================================

    const [job, setJob] = useState(null)         // Thông tin chi tiết việc làm
    const [loading, setLoading] = useState(true) // Trạng thái loading
    const [error, setError] = useState(null)     // Lỗi nếu có

    // ==========================================================================
    // EFFECTS
    // ==========================================================================

    useEffect(() => {
        const fetchJobDetail = async () => {
            setLoading(true)
            try {
                const response = await jobPostsApi.getById(jobId)
                if (response.data.success) {
                    setJob(response.data.data)
                } else {
                    setError('Không thể tải thông tin việc làm')
                }
            } catch (err) {
                console.error(err)
                setError('Lỗi kết nối đến server')
            } finally {
                setLoading(false)
            }
        }

        if (jobId) {
            fetchJobDetail()
        }
    }, [jobId])

    // ==========================================================================
    // RENDER
    // ==========================================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error || 'Không tìm thấy việc làm'}</p>
                    <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
                        &larr; Quay lại danh sách việc làm
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />

            {/* Breadcrumb / Back button */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/jobs" className="inline-flex items-center text-gray-500 hover:text-primary-600 font-medium transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ============================================== */}
                    {/* LEFT COLUMN - MAIN CONTENT */}
                    {/* ============================================== */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Job Header Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                    <div className="flex items-center text-gray-600 font-medium text-lg">
                                        <Building2 className="w-5 h-5 mr-2 text-gray-400" />
                                        {job.companyName}
                                    </div>
                                </div>
                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 p-2">
                                    {job.companyLogoUrl ? (
                                        <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary-600">{job.companyName.charAt(0)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Mức lương</p>
                                    <div className="font-semibold text-primary-600 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        {job.salaryMin && job.salaryMax
                                            ? `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu`
                                            : 'Thỏa thuận'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Địa điểm</p>
                                    <div className="font-medium text-gray-900 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {job.location}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Kinh nghiệm</p>
                                    <div className="font-medium text-gray-900 flex items-center">
                                        <Briefcase className="w-4 h-4 mr-1" />
                                        {job.experienceLevel || 'Không yêu cầu'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Hạn nộp</p>
                                    <div className="font-medium text-gray-900 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(job.applicationDeadline).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Job Description Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-primary-600 pl-3">Chi tiết tin tuyển dụng</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Mô tả công việc</h3>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {job.description}
                                    </div>
                                </div>

                                {job.requirements && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Yêu cầu ứng viên</h3>
                                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                            {job.requirements}
                                        </div>
                                    </div>
                                )}

                                {job.benefits && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Quyền lợi</h3>
                                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                            {job.benefits}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* ============================================== */}
                    {/* RIGHT COLUMN - SIDEBAR INFO */}
                    {/* ============================================== */}
                    <div className="space-y-6">

                        {/* Company Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Thông tin công ty</h3>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mr-3">
                                    {job.companyLogoUrl ? (
                                        <img src={job.companyLogoUrl} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{job.companyName}</div>
                                    <Link to={`/companies/${job.companyId}`} className="text-sm text-primary-600 hover:underline">
                                        Xem trang công ty
                                    </Link>
                                </div>
                            </div>


                        </div>

                        {/* General Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Thông tin chung</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ngày đăng</span>
                                    <span className="font-medium text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Cấp bậc</span>
                                    <span className="font-medium text-gray-900">{job.level || 'Nhân viên'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hình thức</span>
                                    <span className="font-medium text-gray-900">{job.workType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số lượng</span>
                                    <span className="font-medium text-gray-900">{job.numberOfPositions || 1} người</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

export default JobDetail
