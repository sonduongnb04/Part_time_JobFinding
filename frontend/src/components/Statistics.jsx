/**
 * =============================================================================
 * STATISTICS COMPONENT - Thống kê số liệu
 * =============================================================================
 * Component hiển thị các số liệu thống kê của nền tảng trên trang chủ.
 * 
 * Hiển thị:
 * - Số việc làm đang tuyển (Live Jobs)
 * - Số công ty (Companies)
 * - Số ứng viên (Candidates)
 * - Số việc làm mới (New Jobs)
 * 
 * Data:
 * - Fetch từ API: totalJobs, totalCompanies
 * - Mock data: candidates, newJobs (có thể implement API sau)
 * =============================================================================
 */

import { Briefcase, Building2, Users, BriefcaseIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobPostsApi, companiesApi } from '../services/api'

/**
 * Component Statistics - Thống kê số liệu
 */
const Statistics = () => {
  // State lưu số liệu thống kê
  const [stats, setStats] = useState({
    liveJobs: 0,      // Số việc làm đang tuyển
    companies: 0,     // Số công ty
    candidates: 0,    // Số ứng viên
    newJobs: 0,       // Số việc mới
  })
  const [loading, setLoading] = useState(true)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Fetch số liệu thống kê từ API
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch tổng số việc làm
        const jobsResponse = await jobPostsApi.getAll(1, 1)
        const totalJobs = jobsResponse.data?.data?.totalCount || 0

        // Fetch tổng số công ty
        const companiesResponse = await companiesApi.getAll(1, 1)
        const totalCompanies = companiesResponse.data?.data?.totalCount || 0

        // Cập nhật state
        // candidates và newJobs dùng mock data (có thể tạo API sau)
        setStats({
          liveJobs: totalJobs,
          companies: totalCompanies,
          candidates: 3847154,  // Mock data
          newJobs: 7532,        // Mock data - có thể là jobs tạo trong 7 ngày
        })
      } catch (error) {
        console.error('Lỗi fetch thống kê:', error)
        // Sử dụng mock data khi lỗi
        setStats({
          liveJobs: 175324,
          companies: 97354,
          candidates: 3847154,
          newJobs: 7532,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Format số với dấu phân cách hàng nghìn
   * @param {number} num - Số cần format
   */
  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  // ============================================================================
  // CẤU HÌNH CÁC CARD THỐNG KÊ
  // ============================================================================
  const statCards = [
    {
      icon: Briefcase,
      value: formatNumber(stats.liveJobs),
      label: 'Việc làm đang tuyển',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/jobs'  // Click → chuyển đến danh sách việc
    },
    {
      icon: Building2,
      value: formatNumber(stats.companies),
      label: 'Công ty',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: null
    },
  ]

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading skeleton
  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Main render
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon

            // Component nội dung card
            const CardContent = () => (
              <div
                className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full`}
              >
                {/* Icon */}
                <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                {/* Số liệu */}
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                {/* Label */}
                <div className="text-gray-600">{stat.label}</div>
              </div>
            )

            // Wrap trong Link nếu có link
            return stat.link ? (
              <Link key={index} to={stat.link} className="block h-full">
                <CardContent />
              </Link>
            ) : (
              <div key={index} className="h-full">
                <CardContent />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Statistics
