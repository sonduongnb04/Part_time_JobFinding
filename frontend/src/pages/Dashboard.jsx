/**
 * =============================================================================
 * DASHBOARD PAGE - Trang tổng quan của nhà tuyển dụng
 * =============================================================================
 * Trang hiển thị thông tin tổng quan cho nhà tuyển dụng.
 * 
 * Tính năng (sẽ được implement):
 * - Thống kê số tin tuyển dụng
 * - Số lượng ứng viên
 * - Tin tuyển dụng gần đây
 * - Biểu đồ và các metrics
 * =============================================================================
 */

import EmployersDashboardLayout from '../components/EmployersDashboardLayout'

/**
 * Component Dashboard - Trang tổng quan
 */
const Dashboard = () => {
  return (
    <EmployersDashboardLayout>
      <div>
        {/* Tiêu đề trang */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tổng quan</h1>

        {/* Placeholder content - sẽ được implement đầy đủ sau */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Nội dung dashboard sẽ được hiển thị tại đây.
          </p>
        </div>
      </div>
    </EmployersDashboardLayout>
  )
}

export default Dashboard
