/**
 * =============================================================================
 * CTA COMPONENT - Call To Action
 * =============================================================================
 * Component hiển thị 2 khung kêu gọi hành động trên trang chủ:
 * 1. Dành cho ứng viên - Đăng ký tìm việc
 * 2. Dành cho nhà tuyển dụng - Đăng tin tuyển dụng
 * =============================================================================
 */

import { ArrowRight } from 'lucide-react'

/**
 * Component CTA - Call To Action
 */
const CTA = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ============================================== */}
          {/* CARD 1: Dành cho ứng viên */}
          {/* ============================================== */}
          <div className="bg-gray-100 rounded-lg p-8 flex flex-col justify-between min-h-[200px]">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Trở thành ứng viên
              </h3>
              <p className="text-gray-600 mb-6">
                Tham gia cùng hàng nghìn ứng viên và tìm công việc part-time lý tưởng ngay hôm nay.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors w-fit">
              Đăng ký ngay <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ============================================== */}
          {/* CARD 2: Dành cho nhà tuyển dụng */}
          {/* ============================================== */}
          <div className="bg-primary-600 rounded-lg p-8 flex flex-col justify-between min-h-[200px]">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Trở thành nhà tuyển dụng
              </h3>
              <p className="text-primary-100 mb-6">
                Đăng tin tuyển dụng và tìm kiếm ứng viên phù hợp cho công ty của bạn.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors w-fit">
              Đăng ký ngay <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
