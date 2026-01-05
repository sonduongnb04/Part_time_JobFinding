/**
 * =============================================================================
 * CATEGORIES COMPONENT - Danh mục công việc phổ biến
 * =============================================================================
 * Component hiển thị các danh mục công việc phổ biến trên trang chủ.
 * 
 * Tính năng:
 * - Hiển thị các danh mục với icon tương ứng
 * - Fetch số lượng việc làm mỗi danh mục từ API
 * - Click vào danh mục → chuyển đến trang tìm kiếm với filter
 * - Loading skeleton khi đang tải
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Compass, Code, Megaphone, Play, Music, Building2, Cross, Database, ArrowRight } from 'lucide-react'
import { jobPostsApi } from '../services/api'

/**
 * Component Categories - Danh mục việc làm
 */
const Categories = () => {
  const [categories, setCategories] = useState([])   // Danh sách danh mục
  const [loading, setLoading] = useState(true)       // Đang tải

  // ============================================================================
  // MAPPING ICON - Map tên danh mục với icon tương ứng
  // ============================================================================
  const categoryIcons = {
    'Graphics & Design': Compass,
    'Code & Programing': Code,
    'Digital Marketing': Megaphone,
    'Video & Animation': Play,
    'Music & Audio': Music,
    'Account & Finance': Building2,
    'Health & Care': Cross,
    'Data & Science': Database,
  }

  // Danh mục mặc định (sử dụng khi API fail)
  const defaultCategories = [
    { name: 'Graphics & Design', count: 257 },
    { name: 'Code & Programing', count: 212 },
    { name: 'Digital Marketing', count: 250 },
    { name: 'Video & Animation', count: 247 },
    { name: 'Music & Audio', count: 304 },
    { name: 'Account & Finance', count: 107 },
    { name: 'Health & Care', count: 125 },
    { name: 'Data & Science', count: 57 },
  ]

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Fetch số lượng việc làm cho mỗi danh mục
   */
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        // Fetch song song cho tất cả danh mục
        const categoryPromises = defaultCategories.map(async (category) => {
          try {
            const response = await jobPostsApi.getByCategory(category.name, 1, 1)
            const count = response.data?.data?.totalCount || category.count
            return { ...category, count }
          } catch (error) {
            return category // Trả về mặc định nếu API fail
          }
        })

        const results = await Promise.all(categoryPromises)
        setCategories(results)
      } catch (error) {
        console.error('Lỗi fetch danh mục:', error)
        setCategories(defaultCategories)  // Sử dụng mặc định khi lỗi
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryCounts()
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading skeleton
  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Danh mục phổ biến</h2>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Main render
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Danh mục phổ biến</h2>
          <a
            href="#"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Grid danh mục */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.name] || Compass
            return (
              <Link
                key={index}
                to={`/jobs?category=${encodeURIComponent(category.name)}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer block"
              >
                {/* Icon */}
                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                {/* Tên danh mục */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                {/* Số vị trí đang tuyển */}
                <p className="text-gray-600">{category.count} vị trí đang tuyển</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Categories
