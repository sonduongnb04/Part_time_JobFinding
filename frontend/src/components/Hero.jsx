/**
 * =============================================================================
 * HERO COMPONENT - Banner chính trang chủ
 * =============================================================================
 * Component banner lớn trên trang chủ với form tìm kiếm việc làm.
 * 
 * Tính năng:
 * - Tiêu đề và slogan
 * - Form tìm kiếm (từ khóa + địa điểm)
 * - Gợi ý tìm kiếm nhanh
 * - Illustration bên phải (chỉ hiển thị trên desktop)
 * 
 * Props:
 * @param {Function} onSearch - Callback khi user submit tìm kiếm
 * =============================================================================
 */

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'

/**
 * Component Hero - Banner chính
 */
const Hero = ({ onSearch }) => {
  // State cho form tìm kiếm
  const [jobTitle, setJobTitle] = useState('')   // Từ khóa công việc
  const [location, setLocation] = useState('')   // Địa điểm

  /**
   * Xử lý submit form tìm kiếm
   * @param {Event} e - Form submit event
   */
  const handleSearch = (e) => {
    e.preventDefault()
    onSearch({ jobTitle, location })
  }

  // Danh sách gợi ý tìm kiếm nhanh
  const suggestions = ['Designer', 'Programing', 'Digital Marketing', 'Video', 'Animation']

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ============================================== */}
          {/* BÊN TRÁI - Nội dung chính */}
          {/* ============================================== */}
          <div>
            {/* Tiêu đề */}
            <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Tìm công việc phù hợp với sở thích và kỹ năng của bạn.
            </h1>

            {/* Form tìm kiếm */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-4 mb-4">
                {/* Input từ khóa */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Tên công việc, từ khóa..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {/* Input địa điểm */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Địa điểm"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {/* Nút tìm kiếm */}
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
                >
                  Tìm việc
                </button>
              </div>
            </form>

            {/* Gợi ý tìm kiếm nhanh */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Gợi ý:</span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setJobTitle(suggestion)
                      onSearch({ jobTitle: suggestion, location })
                    }}
                    className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* BÊN PHẢI - Illustration */}
          {/* Chỉ hiển thị trên desktop (lg trở lên) */}
          {/* ============================================== */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  {/* Icon chính */}
                  <div className="w-64 h-64 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                    <div className="text-6xl">👨‍💻</div>
                  </div>
                  {/* Các icon phụ */}
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">💡</div>
                    <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">⚙️</div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">✏️</div>
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">🚀</div>
                    <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">❤️</div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">☁️</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
