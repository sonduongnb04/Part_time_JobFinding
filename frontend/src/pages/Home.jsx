/**
 * =============================================================================
 * HOME PAGE - Trang chủ ứng dụng
 * =============================================================================
 * Trang landing chính của ứng dụng tìm việc làm.
 * 
 * Cấu trúc các section:
 * 1. Header - Thanh điều hướng
 * 2. Hero - Banner chính với form tìm kiếm
 * 3. Statistics - Thống kê số liệu
 * 4. Categories - Danh mục công việc phổ biến
 * 5. CTA - Call to action
 * =============================================================================
 */

import { useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Statistics from '../components/Statistics'
import Categories from '../components/Categories'
import CTA from '../components/CTA'
import { useNavigate } from 'react-router-dom'
import { jobPostsApi } from '../services/api'

/**
 * Component Home - Trang chủ
 */
const Home = () => {
  const navigate = useNavigate()

  /**
   * Xử lý tìm kiếm việc làm
   * Chuyển hướng sang trang danh sách việc với params tìm kiếm
   * @param {Object} params - Tham số tìm kiếm
   * @param {string} params.jobTitle - Từ khóa công việc
   * @param {string} params.location - Địa điểm
   */
  const handleSearch = ({ jobTitle, location }) => {
    const params = new URLSearchParams()
    if (jobTitle) params.append('searchTerm', jobTitle)
    if (location) params.append('location', location)

    // Chuyển đến trang danh sách việc với params
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Thanh điều hướng */}
      <Header />

      <main>
        {/* Banner chính với form tìm kiếm */}
        <Hero onSearch={handleSearch} />

        {/* Thống kê số liệu */}
        <Statistics />

        {/* Danh mục công việc phổ biến */}
        <Categories />

        {/* Call to action */}
        <CTA />
      </main>
    </div>
  )
}

export default Home
