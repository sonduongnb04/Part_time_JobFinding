/**
 * =============================================================================
 * JOB CARD COMPONENT - Thẻ hiển thị tin tuyển dụng
 * =============================================================================
 * Component hiển thị thông tin tóm tắt của một tin tuyển dụng.
 * Được sử dụng trong danh sách việc làm (JobListing page).
 * 
 * Hiển thị:
 * - Logo công ty
 * - Tên công việc và tên công ty
 * - Địa điểm, mức lương, loại công việc, ngày đăng
 * - Danh mục công việc
 * - Nút xem chi tiết
 * - Badge "Gấp" nếu là tin urgent
 * 
 * Props:
 * @param {Object} job - Đối tượng chứa thông tin tin tuyển dụng
 *   - id: ID tin tuyển dụng
 *   - title: Tên công việc
 *   - companyName: Tên công ty
 *   - companyLogoUrl: URL logo công ty
 *   - location: Địa điểm làm việc
 *   - salaryMin, salaryMax: Khoảng lương
 *   - workType: Loại công việc (Full-time, Part-time, v.v.)
 *   - createdAt: Ngày đăng tin
 *   - category: Danh mục việc làm
 *   - isUrgent: Tin tuyển gấp hay không
 * =============================================================================
 */

import { MapPin, DollarSign, Clock, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Component JobCard - Thẻ hiển thị thông tin việc làm
 * @param {Object} props
 * @param {Object} props.job - Thông tin tin tuyển dụng
 */
const JobCard = ({ job }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">

                {/* ============================================== */}
                {/* LOGO CÔNG TY */}
                {/* ============================================== */}
                <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
                    {job.companyLogoUrl ? (
                        // Hiển thị logo nếu có
                        <img
                            src={job.companyLogoUrl}
                            alt={`Logo ${job.companyName}`}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        // Hiển thị chữ cái đầu nếu không có logo
                        <span className="text-2xl font-bold text-primary-600">
                            {job.companyName.charAt(0)}
                        </span>
                    )}
                </div>

                {/* ============================================== */}
                {/* NỘI DUNG TIN TUYỂN DỤNG */}
                {/* ============================================== */}
                <div className="flex-1">
                    {/* Header: Tên việc + Badge urgent */}
                    <div className="flex justify-between items-start">
                        <div>
                            {/* Tên công việc */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {job.title}
                            </h3>
                            {/* Tên công ty */}
                            <p className="text-gray-600 font-medium mb-3">{job.companyName}</p>
                        </div>
                        {/* Badge "Gấp" nếu isUrgent = true */}
                        {job.isUrgent && (
                            <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                                Gấp
                            </span>
                        )}
                    </div>

                    {/* ============================================== */}
                    {/* THÔNG TIN CHI TIẾT: Địa điểm, Lương, Loại, Ngày */}
                    {/* ============================================== */}
                    <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4 text-sm text-gray-500">
                        {/* Địa điểm */}
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                        </div>
                        {/* Mức lương */}
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>
                                {job.salaryMin && job.salaryMax
                                    ? `${job.salaryMin.toLocaleString('vi-VN')} - ${job.salaryMax.toLocaleString('vi-VN')} VND`
                                    : 'Thỏa thuận'}
                            </span>
                        </div>
                        {/* Loại công việc */}
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.workType}</span>
                        </div>
                        {/* Ngày đăng */}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>

                    {/* ============================================== */}
                    {/* FOOTER: Danh mục + Nút xem chi tiết */}
                    {/* ============================================== */}
                    <div className="flex items-center gap-2">
                        {/* Badge danh mục */}
                        {job.category && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                {job.category}
                            </span>
                        )}
                        {/* Nút xem chi tiết */}
                        <Link
                            to={`/jobs/${job.id}`}
                            className="ml-auto px-4 py-2 bg-primary-50 text-primary-600 text-sm font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                        >
                            Xem chi tiết
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobCard
