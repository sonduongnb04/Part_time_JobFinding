/**
 * =============================================================================
 * COMPANY DETAIL PAGE - Trang chi tiết công ty
 * =============================================================================
 * Trang hiển thị thông tin công ty và danh sách việc làm của họ.
 * 
 * Tính năng:
 * - Hiển thị logo, tên, mô tả công ty
 * - Danh sách việc làm đang tuyển của công ty
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Globe, Building2, ChevronLeft, Mail, Phone } from 'lucide-react'
import Header from '../components/Header'
import JobCard from '../components/JobCard'
import { companiesApi, jobPostsApi } from '../services/api'

const CompanyDetail = () => {
    const { companyId } = useParams()

    // State
    const [company, setCompany] = useState(null)
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch company details and their jobs in parallel
                const [companyRes, jobsRes] = await Promise.all([
                    companiesApi.getById(companyId),
                    jobPostsApi.getByCompany(companyId, 1, 10)
                ])

                if (companyRes.data.success) {
                    setCompany(companyRes.data.data)
                } else {
                    setError('Không thể tải thông tin công ty')
                }

                if (jobsRes.data.success) {
                    setJobs(jobsRes.data.data.items)
                }
            } catch (err) {
                console.error(err)
                setError('Lỗi kết nối đến server')
            } finally {
                setLoading(false)
            }
        }

        if (companyId) {
            fetchData()
        }
    }, [companyId])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-24 bg-gray-200 rounded-lg w-1/4"></div>
                        <div className="space-y-4 pt-8">
                            <div className="h-40 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error || 'Không tìm thấy công ty'}</p>
                    <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                        &larr; Quay lại trang chủ
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />

            {/* Back button */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button onClick={() => window.history.back()} className="inline-flex items-center text-gray-500 hover:text-primary-600 font-medium transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Quay lại
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Company Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                        <div className="w-24 h-24 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center p-2 flex-shrink-0">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                            ) : (
                                <Building2 className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-600">
                                {company.address && (
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {company.address}
                                    </div>
                                )}
                                {company.website && (
                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary-600">
                                        <Globe className="w-4 h-4 mr-1" />
                                        Website
                                    </a>
                                )}
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-1" />
                                    {company.email || 'Liên hệ trực tiếp'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: About */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Giới thiệu công ty</h2>
                            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {company.description || 'Chưa có thông tin giới thiệu.'}
                            </div>
                        </div>

                        {/* Available Jobs */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Việc làm đang tuyển ({jobs.length})</h2>
                            {jobs.length > 0 ? (
                                <div className="space-y-4">
                                    {jobs.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500">Công ty này hiện chưa có tin tuyển dụng nào khác.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Info/Contact */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Trụ sở chính</p>
                                        <p className="text-gray-500">{company.address || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Globe className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Website</p>
                                        {company.website ? (
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">
                                                {company.website}
                                            </a>
                                        ) : (
                                            <p className="text-gray-500">Chưa cập nhật</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Phone className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Điện thoại</p>
                                        <p className="text-gray-500">{company.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CompanyDetail
