/**
 * =============================================================================
 * JOB APPLICATIONS PAGE - Trang quản lý ứng viên cho tin tuyển dụng
 * =============================================================================
 * Trang dành cho nhà tuyển dụng xem và quản lý danh sách ứng viên.
 * 
 * Tính năng:
 * - Xem danh sách ứng viên đã ứng tuyển cho một tin cụ thể
 * - Xem chi tiết từng ứng viên (cover letter, CV)
 * - Cập nhật trạng thái ứng viên (Pending, Interview, Hired, Rejected)
 * - Xem hồ sơ đầy đủ của ứng viên (Modal)
 * 
 * URL Params:
 * - jobId: ID của tin tuyển dụng
 * 
 * Application Status:
 * - 0: Pending (Đang chờ)
 * - 1: Reviewed (Đã xem)
 * - 2: Interview (Phỏng vấn)
 * - 3: Rejected (Từ chối)
 * - 4: Hired (Tuyển dụng)
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import EmployersDashboardLayout from '../../components/EmployersDashboardLayout'
import { applicationsApi, jobPostsApi, profilesApi } from '../../services/api'
import {
    User, Calendar, Mail, Phone, MapPin,
    CheckCircle, XCircle, Clock, MessageSquare,
    FileText, Briefcase, GraduationCap, Award, X
} from 'lucide-react'

/**
 * Component JobApplications - Trang quản lý ứng viên
 */
const JobApplications = () => {
    const navigate = useNavigate()
    const { jobId } = useParams()  // Lấy jobId từ URL

    // ==========================================================================
    // STATE MANAGEMENT
    // ==========================================================================

    const [job, setJob] = useState(null)                 // Thông tin tin tuyển dụng
    const [applications, setApplications] = useState([])  // Danh sách ứng viên
    const [loading, setLoading] = useState(true)         // Đang tải
    const [error, setError] = useState(null)             // Lỗi
    const [selectedApp, setSelectedApp] = useState(null) // Ứng viên được chọn để xem chi tiết
    const [profileModal, setProfileModal] = useState({ open: false, profile: null, loading: false })

    // ==========================================================================
    // CONSTANTS - Mapping trạng thái ứng viên
    // ==========================================================================
    const APP_STATUS = {
        PENDING: 1,      // Pending
        REVIEWING: 2,    // Reviewing
        SHORTLISTED: 3,  // Shortlisted
        INTERVIEWING: 4, // Interviewing
        OFFERED: 5,      // Offered
        ACCEPTED: 6,     // Accepted
        REJECTED: 7,     // Rejected
        WITHDRAWN: 8,    // Withdrawn
        EXPIRED: 9       // Expired
    }

    // ==========================================================================
    // EFFECTS
    // ==========================================================================

    useEffect(() => {
        fetchData()
    }, [jobId])

    // ==========================================================================
    // API FUNCTIONS
    // ==========================================================================

    /**
     * Fetch thông tin tin tuyển dụng và danh sách ứng viên
     */
    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch thông tin tin tuyển dụng
            const jobRes = await jobPostsApi.getById(jobId)
            if (jobRes.data.success) {
                setJob(jobRes.data.data)
            }

            // Fetch danh sách ứng viên
            const appRes = await applicationsApi.getByJobId(jobId)
            if (appRes.data.success) {
                setApplications(appRes.data.data.items)
            }
        } catch (err) {
            console.error(err)
            setError('Không thể tải danh sách ứng viên')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Cập nhật trạng thái ứng viên
     * @param {number} appId - ID application
     * @param {number} newStatusId - Trạng thái mới
     */
    const handleStatusUpdate = async (appId, newStatusId) => {
        try {
            await applicationsApi.updateStatus(appId, newStatusId, "Đã cập nhật bởi nhà tuyển dụng")

            // Cập nhật local state
            setApplications(prev => prev.map(app =>
                app.id === appId ? { ...app, statusId: newStatusId } : app
            ))
            // Cập nhật selectedApp nếu đang xem
            if (selectedApp?.id === appId) {
                setSelectedApp(prev => ({ ...prev, statusId: newStatusId }))
            }
        } catch (err) {
            alert('Không thể cập nhật trạng thái')
        }
    }

    /**
     * Fetch hồ sơ đầy đủ của ứng viên
     * @param {number} profileId - ID profile
     */
    const fetchProfile = async (profileId) => {
        setProfileModal({ open: true, profile: null, loading: true })
        try {
            const res = await profilesApi.getById(profileId)
            if (res.data.success) {
                setProfileModal({ open: true, profile: res.data.data, loading: false })
            } else {
                setProfileModal({ open: true, profile: null, loading: false })
            }
        } catch (err) {
            console.error('Không thể tải hồ sơ:', err)
            setProfileModal({ open: true, profile: null, loading: false })
        }
    }

    /**
     * Đóng modal hồ sơ
     */
    const closeProfileModal = () => {
        setProfileModal({ open: false, profile: null, loading: false })
    }

    // ==========================================================================
    // HELPER FUNCTIONS
    // ==========================================================================

    /**
     * Render badge trạng thái ứng viên
     */
    const getStatusBadge = (statusId) => {
        switch (statusId) {
            case APP_STATUS.PENDING:
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">Pending</span>
            case APP_STATUS.REVIEWING:
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">Reviewing</span>
            case APP_STATUS.SHORTLISTED:
                return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">Shortlisted</span>
            case APP_STATUS.INTERVIEWING:
                return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">Interviewing</span>
            case APP_STATUS.OFFERED:
                return <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-semibold">Offered</span>
            case APP_STATUS.ACCEPTED:
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Accepted</span>
            case APP_STATUS.REJECTED:
                return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Rejected</span>
            case APP_STATUS.WITHDRAWN:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Withdrawn</span>
            case APP_STATUS.EXPIRED:
                return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">Expired</span>
            default:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Unknown</span>
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
            <div className="max-w-6xl mx-auto">

                {/* ============================================== */}
                {/* HEADER */}
                {/* ============================================== */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Danh sách ứng viên</h1>
                        <p className="text-gray-600 mt-1">
                            Cho tin: <span className="font-semibold text-primary-600">{job?.title}</span>
                        </p>
                    </div>
                    <Link
                        to="/my-jobs"
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                        ← Quay lại danh sách tin
                    </Link>
                </div>

                <div className="flex gap-6">

                    {/* ============================================== */}
                    {/* CỘT TRÁI - DANH SÁCH ỨNG VIÊN */}
                    {/* ============================================== */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="font-semibold text-gray-700">{applications.length} ứng viên</span>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {applications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Chưa có ứng viên nào ứng tuyển.
                                </div>
                            ) : (
                                applications.map(app => (
                                    <div
                                        key={app.id}
                                        onClick={() => setSelectedApp(app)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedApp?.id === app.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center">
                                                {/* Avatar */}
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold mr-3">
                                                    {(app.applicantName?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{app.applicantName || 'Không rõ'}</h3>
                                                    <p className="text-xs text-gray-500">{new Date(app.appliedDate).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                            </div>
                                            {getStatusBadge(app.statusId)}
                                        </div>
                                        <div className="ml-13 pl-13 text-sm text-gray-600 truncate">
                                            {app.coverLetter || 'Không có thư giới thiệu.'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ============================================== */}
                    {/* CỘT PHẢI - CHI TIẾT ỨNG VIÊN */}
                    {/* ============================================== */}
                    <div className="w-[450px]">
                        {selectedApp ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">

                                {/* Header: Thông tin cơ bản */}
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                                        {(selectedApp.applicantName?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedApp.applicantName}</h2>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Mail className="w-3 h-3 mr-1" />
                                            <span>{selectedApp.email}</span>
                                        </div>
                                        {selectedApp.phone && (
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Phone className="w-3 h-3 mr-1" />
                                                <span>{selectedApp.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Các nút hành động */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedApp.id, APP_STATUS.INTERVIEWING)}
                                        className="flex items-center justify-center px-4 py-2 border border-purple-200 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                                    >
                                        <Calendar className="w-4 h-4 mr-2" /> Phỏng vấn
                                    </button>
                                    {selectedApp.statusId === APP_STATUS.ACCEPTED ? (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedApp.id, APP_STATUS.REJECTED)}
                                            className="flex items-center justify-center px-4 py-2 border border-gray-200 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> Hủy tuyển
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedApp.id, APP_STATUS.ACCEPTED)}
                                            className="flex items-center justify-center px-4 py-2 border border-green-200 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Tuyển
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStatusUpdate(selectedApp.id, APP_STATUS.REJECTED)}
                                        className="flex items-center justify-center px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 col-span-2"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" /> Từ chối
                                    </button>
                                </div>

                                {/* Thư giới thiệu */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Thư giới thiệu</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                        {selectedApp.coverLetter || 'Không có thư giới thiệu.'}
                                    </div>
                                </div>

                                {/* CV và Profile */}
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">CV & Hồ sơ</h3>
                                    <div className="space-y-2">
                                        {selectedApp.resumeUrl ? (
                                            <a
                                                href={selectedApp.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center px-4 py-2 border border-primary-200 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 mr-2" /> Tải CV
                                            </a>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic text-center py-2">Không có file CV.</p>
                                        )}
                                        <button
                                            onClick={() => fetchProfile(selectedApp.profileId)}
                                            className="w-full flex items-center justify-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <User className="w-4 h-4 mr-2" /> Xem hồ sơ đầy đủ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Empty state
                            <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed p-12 text-center h-full flex flex-col items-center justify-center text-gray-500">
                                <User className="w-12 h-12 mb-4 opacity-50" />
                                <p>Chọn một ứng viên để xem chi tiết</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================== */}
            {/* MODAL XEM HỒ SƠ ĐẦY ĐỦ */}
            {/* ============================================== */}
            {profileModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
                            <h2 className="text-xl font-bold text-gray-900">Hồ sơ ứng viên</h2>
                            <button
                                onClick={closeProfileModal}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {profileModal.loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                                </div>
                            ) : profileModal.profile ? (
                                <div className="space-y-6">

                                    {/* Thông tin cơ bản */}
                                    <div className="flex items-start space-x-4">
                                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                                            {(profileModal.profile.fullName?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900">{profileModal.profile.fullName || 'Không rõ'}</h3>
                                                    {profileModal.profile.headline && (
                                                        <p className="text-gray-600 mt-1">{profileModal.profile.headline}</p>
                                                    )}
                                                </div>
                                                {profileModal.profile.userId && (
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/chat?recipientId=${profileModal.profile.userId}&jobPostId=${job?.id}`)
                                                        }}
                                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                                    >
                                                        <MessageSquare className="w-4 h-4 mr-2" />
                                                        Nhắn tin
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                                                {profileModal.profile.email && (
                                                    <span className="flex items-center"><Mail className="w-4 h-4 mr-1" />{profileModal.profile.email}</span>
                                                )}
                                                {profileModal.profile.phone && (
                                                    <span className="flex items-center"><Phone className="w-4 h-4 mr-1" />{profileModal.profile.phone}</span>
                                                )}
                                                {profileModal.profile.address && (
                                                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{profileModal.profile.address}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Giới thiệu bản thân */}
                                    {profileModal.profile.bio && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Giới thiệu</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{profileModal.profile.bio}</p>
                                        </div>
                                    )}

                                    {/* Kỹ năng */}
                                    {profileModal.profile.skills && profileModal.profile.skills.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center">
                                                <Award className="w-4 h-4 mr-2" /> Kỹ năng
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profileModal.profile.skills.map((skill, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                                        {skill.skillName || skill.name || skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Kinh nghiệm làm việc */}
                                    {profileModal.profile.experiences && profileModal.profile.experiences.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                                <Briefcase className="w-4 h-4 mr-2" /> Kinh nghiệm làm việc
                                            </h4>
                                            <div className="space-y-4">
                                                {profileModal.profile.experiences.map((exp, idx) => (
                                                    <div key={idx} className="border-l-2 border-primary-300 pl-4">
                                                        <h5 className="font-semibold text-gray-900">{exp.position || exp.title}</h5>
                                                        <p className="text-primary-600 font-medium">{exp.company || exp.companyName}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {exp.startDate && new Date(exp.startDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                                                            {' — '}
                                                            {exp.isCurrent ? 'Hiện tại' : (exp.endDate && new Date(exp.endDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }))}
                                                        </p>
                                                        {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Học vấn */}
                                    {profileModal.profile.educations && profileModal.profile.educations.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                                <GraduationCap className="w-4 h-4 mr-2" /> Học vấn
                                            </h4>
                                            <div className="space-y-4">
                                                {profileModal.profile.educations.map((edu, idx) => (
                                                    <div key={idx} className="border-l-2 border-blue-300 pl-4">
                                                        <h5 className="font-semibold text-gray-900">{edu.school || edu.institution}</h5>
                                                        <p className="text-blue-600 font-medium">{edu.degree} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {edu.startDate && new Date(edu.startDate).getFullYear()}
                                                            {' — '}
                                                            {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Hiện tại'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Chứng chỉ */}
                                    {profileModal.profile.certificates && profileModal.profile.certificates.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                                <Award className="w-4 h-4 mr-2" /> Chứng chỉ
                                            </h4>
                                            <div className="space-y-2">
                                                {profileModal.profile.certificates.map((cert, idx) => (
                                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                        <div>
                                                            <h5 className="font-medium text-gray-900">{cert.name || cert.title}</h5>
                                                            <p className="text-sm text-gray-500">{cert.issuer} • {cert.issueDate && new Date(cert.issueDate).getFullYear()}</p>
                                                        </div>
                                                        {cert.credentialUrl && (
                                                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
                                                                Xem
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Profile not found
                                <div className="text-center py-12 text-gray-500">
                                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Không tìm thấy hồ sơ hoặc hồ sơ không khả dụng.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </EmployersDashboardLayout>
    )
}

export default JobApplications
