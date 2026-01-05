/**
 * =============================================================================
 * APP.JSX - Component gốc của ứng dụng React
 * =============================================================================
 * File này là entry point của ứng dụng React, chứa:
 * - Cấu hình React Router (định tuyến các trang)
 * - NotificationProvider (quản lý thông báo toast)
 * - ChatListener (lắng nghe tin nhắn real-time)
 * 
 * Cấu trúc route:
 * - Trang công khai: Trang chủ, Danh sách việc làm, Đăng nhập, Đăng ký
 * - Trang Nhà tuyển dụng: Dashboard, Đăng tin, Quản lý tin, Hồ sơ
 * - Trang Chat: Nhắn tin real-time
 * - Trang Admin: Quản trị hệ thống, Xem logs
 * =============================================================================
 */

// Import React Router để điều hướng giữa các trang
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Provider quản lý thông báo toast toàn ứng dụng
import { NotificationProvider } from './components/NotificationProvider'
// Component lắng nghe tin nhắn mới và hiển thị thông báo
import ChatListener from './components/ChatListener'

// =============================================================================
// IMPORT CÁC TRANG (PAGES)
// =============================================================================

// Trang công khai
import Home from './pages/Home'                    // Trang chủ
import Login from './pages/Login'                  // Đăng nhập
import Register from './pages/Register'            // Đăng ký tài khoản
import JobListing from './pages/JobListing'        // Danh sách việc làm
import JobDetail from './pages/JobDetail'          // Chi tiết việc làm
import CompanyDetail from './pages/CompanyDetail'  // Chi tiết công ty
import ForgotPassword from './pages/ForgotPassword' // Quên mật khẩu

// Trang Nhà tuyển dụng (Employer)
import Dashboard from './pages/Dashboard'          // Bảng điều khiển NTD
import PostJob from './pages/PostJob'              // Đăng tin tuyển dụng
import MyJobs from './pages/MyJobs'                // Quản lý tin đã đăng
import EmployerProfile from './pages/EmployerProfile' // Hồ sơ công ty

// Trang xem đơn ứng tuyển
import JobApplications from './pages/employer/JobApplications' // Danh sách ứng viên

// Trang Chat
import Chat from './pages/Chat'                    // Nhắn tin real-time

// Trang Admin (Quản trị viên)
import AdminDashboard from './pages/admin/AdminDashboard' // Dashboard Admin
import SystemLogs from './pages/admin/SystemLogs'         // Xem nhật ký hệ thống

/**
 * Component App - Component gốc của ứng dụng
 * Wrap toàn bộ ứng dụng với:
 * 1. NotificationProvider - Cung cấp context cho thông báo toast
 * 2. Router - Quản lý điều hướng
 * 3. ChatListener - Lắng nghe tin nhắn mới
 */
function App() {
  return (
    // NotificationProvider wrap toàn bộ app để có thể hiển thị toast ở mọi nơi
    <NotificationProvider>
      {/* BrowserRouter sử dụng History API để điều hướng */}
      <Router>
        {/* 
          ChatListener - Component không hiển thị UI
          Lắng nghe tin nhắn mới qua SignalR và hiển thị toast notification
        */}
        <ChatListener />

        {/* Định nghĩa các routes (đường dẫn) */}
        <Routes>
          {/* ============================================== */}
          {/* TRANG CÔNG KHAI - Ai cũng truy cập được */}
          {/* ============================================== */}
          <Route path="/" element={<Home />} />                   {/* Trang chủ */}
          <Route path="/jobs" element={<JobListing />} />         {/* Danh sách việc làm */}
          <Route path="/jobs/:jobId" element={<JobDetail />} />   {/* Chi tiết việc làm */}
          <Route path="/companies/:companyId" element={<CompanyDetail />} /> {/* Chi tiết công ty */}
          <Route path="/login" element={<Login />} />             {/* Đăng nhập */}
          <Route path="/register" element={<Register />} />       {/* Đăng ký */}
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Quên mật khẩu */}

          {/* ============================================== */}
          {/* TRANG NHÀ TUYỂN DỤNG (EMPLOYER) */}
          {/* ============================================== */}
          <Route path="/dashboard" element={<EmployerProfile />} />     {/* Dashboard redirects to profile */}
          <Route path="/post-job" element={<PostJob />} />        {/* Đăng tin mới */}
          <Route path="/edit-job/:jobId" element={<PostJob />} /> {/* Sửa tin (dùng chung component) */}
          <Route path="/my-jobs" element={<MyJobs />} />          {/* Danh sách tin đã đăng */}
          <Route path="/employer-profile" element={<EmployerProfile />} /> {/* Hồ sơ công ty */}
          <Route path="/jobs/:jobId/applications" element={<JobApplications />} /> {/* Xem đơn ứng tuyển */}

          {/* ============================================== */}
          {/* TRANG CHAT - Nhắn tin real-time */}
          {/* ============================================== */}
          <Route path="/chat" element={<Chat />} />               {/* Trang chat/inbox */}

          {/* ============================================== */}
          {/* TRANG ADMIN - Chỉ dành cho quản trị viên */}
          {/* ============================================== */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Dashboard Admin */}
          <Route path="/admin/logs" element={<SystemLogs />} />   {/* Xem nhật ký hệ thống */}
        </Routes>
      </Router>
    </NotificationProvider>
  )
}

// Export component App để sử dụng trong main.jsx
export default App
