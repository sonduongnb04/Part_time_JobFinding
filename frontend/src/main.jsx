/**
 * =============================================================================
 * MAIN.JSX - Entry Point của ứng dụng React
 * =============================================================================
 * File này là điểm khởi đầu của ứng dụng React.
 * 
 * Chức năng:
 * - Khởi tạo React root
 * - Render component App vào DOM
 * - Wrap App trong StrictMode để phát hiện lỗi
 * - Import file CSS global
 * =============================================================================
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Tạo root và render ứng dụng
// StrictMode giúp phát hiện các vấn đề tiềm ẩn trong development
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
