/**
 * =============================================================================
 * NOTIFICATION PROVIDER - Hệ thống thông báo Toast
 * =============================================================================
 * Component này cung cấp hệ thống thông báo toast cho toàn ứng dụng.
 * 
 * Tính năng:
 * - Hiển thị thông báo popup ở góc phải dưới màn hình
 * - Hỗ trợ nhiều loại: tin nhắn, thành công, lỗi, thông tin
 * - Tự động đóng sau thời gian cấu hình
 * - Animation slide-in/slide-out mượt mà
 * - Progress bar đếm ngược thời gian
 * - Có thể click để thực hiện action
 * 
 * Cách sử dụng:
 * 1. Wrap app trong <NotificationProvider>
 * 2. Import hook: import { useNotification } from './NotificationProvider'
 * 3. Gọi: const { showMessage, showSuccess, showError } = useNotification()
 * =============================================================================
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, MessageCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

// Context để share state thông báo giữa các components
const NotificationContext = createContext(null)

/**
 * Hook để sử dụng notification trong các components
 * @returns {Object} Các hàm để hiển thị thông báo
 * @throws {Error} Nếu không được wrap trong NotificationProvider
 */
export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification phải được sử dụng trong NotificationProvider')
    }
    return context
}

// Thời gian hiển thị mặc định của toast (5 giây)
const TOAST_DURATION = 5000

/**
 * NotificationProvider - Component wrapper để cung cấp hệ thống thông báo
 * @param {Object} props
 * @param {React.ReactNode} props.children - Các component con
 */
export const NotificationProvider = ({ children }) => {
    // Danh sách các toast đang hiển thị
    const [toasts, setToasts] = useState([])

    /**
     * Thêm một toast mới vào danh sách
     * @param {Object} toast - Thông tin toast
     * @param {string} toast.title - Tiêu đề
     * @param {string} toast.description - Nội dung mô tả
     * @param {string} toast.type - Loại: 'message' | 'success' | 'error' | 'info'
     * @param {string} toast.avatar - Ký tự avatar (tùy chọn)
     * @param {Function} toast.onClick - Hàm gọi khi click (tùy chọn)
     * @param {number} toast.duration - Thời gian hiển thị (ms)
     * @returns {number} ID của toast để có thể remove
     */
    const addToast = useCallback((toast) => {
        // Tạo ID unique cho toast
        const id = Date.now() + Math.random()
        const newToast = {
            id,
            type: 'info',          // Loại mặc định
            duration: TOAST_DURATION, // Thời gian mặc định
            ...toast              // Override với props truyền vào
        }

        // Thêm vào danh sách
        setToasts(prev => [...prev, newToast])

        // Tự động xóa sau duration
        if (newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }, [])

    /**
     * Xóa một toast khỏi danh sách
     * @param {number} id - ID của toast cần xóa
     */
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    // =========================================================================
    // CÁC HÀM SHORTHAND ĐỂ HIỂN THỊ TOAST
    // =========================================================================

    /**
     * Hiển thị thông báo tin nhắn mới
     * @param {Object} message - Thông tin tin nhắn
     */
    const showMessage = useCallback((message) => {
        return addToast({
            type: 'message',
            ...message
        })
    }, [addToast])

    /**
     * Hiển thị thông báo thành công (màu xanh lá)
     * @param {string} title - Tiêu đề
     * @param {string} description - Mô tả
     */
    const showSuccess = useCallback((title, description) => {
        return addToast({
            type: 'success',
            title,
            description
        })
    }, [addToast])

    /**
     * Hiển thị thông báo lỗi (màu đỏ)
     * @param {string} title - Tiêu đề
     * @param {string} description - Mô tả
     */
    const showError = useCallback((title, description) => {
        return addToast({
            type: 'error',
            title,
            description
        })
    }, [addToast])

    /**
     * Hiển thị thông báo thông tin (màu xanh dương)
     * @param {string} title - Tiêu đề
     * @param {string} description - Mô tả
     */
    const showInfo = useCallback((title, description) => {
        return addToast({
            type: 'info',
            title,
            description
        })
    }, [addToast])

    // Giá trị context được share xuống các component con
    const value = {
        toasts,
        addToast,
        removeToast,
        showMessage,
        showSuccess,
        showError,
        showInfo
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Container hiển thị các toast */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </NotificationContext.Provider>
    )
}

/**
 * ToastContainer - Container chứa tất cả các toast
 * Vị trí: cố định ở góc phải dưới màn hình
 */
const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    )
}

/**
 * Toast - Component hiển thị một thông báo đơn lẻ
 * @param {Object} props
 * @param {Object} props.toast - Thông tin toast
 * @param {Function} props.onRemove - Hàm gọi khi đóng toast
 */
const Toast = ({ toast, onRemove }) => {
    // State để xử lý animation khi đóng
    const [isExiting, setIsExiting] = useState(false)

    /**
     * Đóng toast với animation
     */
    const handleRemove = () => {
        setIsExiting(true)  // Kích hoạt animation exit
        setTimeout(() => {
            onRemove(toast.id)  // Xóa khỏi danh sách sau khi animation xong
        }, 200)
    }

    /**
     * Lấy icon tương ứng với loại toast
     */
    const getIcon = () => {
        switch (toast.type) {
            case 'message':
                return <MessageCircle className="h-5 w-5 text-primary-600" />
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'error':
                return <AlertTriangle className="h-5 w-5 text-red-600" />
            case 'info':
            default:
                return <Info className="h-5 w-5 text-blue-600" />
        }
    }

    /**
     * Lấy màu border trái tương ứng với loại toast
     */
    const getBorderColor = () => {
        switch (toast.type) {
            case 'message':
                return 'border-l-primary-500'
            case 'success':
                return 'border-l-green-500'
            case 'error':
                return 'border-l-red-500'
            case 'info':
            default:
                return 'border-l-blue-500'
        }
    }

    /**
     * Xử lý khi click vào toast
     */
    const handleClick = () => {
        if (toast.onClick) {
            toast.onClick()  // Gọi callback
            handleRemove()   // Đóng toast
        }
    }

    return (
        <div
            className={`
                bg-white rounded-lg shadow-lg border border-gray-200 border-l-4 ${getBorderColor()}
                p-4 min-w-[320px] max-w-md
                transform transition-all duration-200 ease-out
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
                ${toast.onClick ? 'cursor-pointer hover:shadow-xl' : ''}
                animate-slide-in
            `}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                {/* Icon hoặc Avatar */}
                <div className="flex-shrink-0 mt-0.5">
                    {toast.avatar ? (
                        // Hiển thị avatar nếu có (cho thông báo tin nhắn)
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow">
                            {toast.avatar}
                        </div>
                    ) : (
                        // Hiển thị icon theo loại toast
                        getIcon()
                    )}
                </div>

                {/* Nội dung */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            {/* Tiêu đề */}
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {toast.title}
                            </p>
                            {/* Mô tả (tùy chọn) */}
                            {toast.description && (
                                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                    {toast.description}
                                </p>
                            )}
                            {/* Thời gian (tùy chọn) */}
                            {toast.time && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {toast.time}
                                </p>
                            )}
                        </div>

                        {/* Nút đóng */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()  // Ngăn trigger onClick của toast
                                handleRemove()
                            }}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress bar - Thanh đếm ngược thời gian còn lại */}
            {toast.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-lg overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${toast.type === 'message' ? 'from-primary-500 to-primary-400' :
                            toast.type === 'success' ? 'from-green-500 to-green-400' :
                                toast.type === 'error' ? 'from-red-500 to-red-400' :
                                    'from-blue-500 to-blue-400'
                            } animate-progress`}
                        style={{
                            animation: `progress ${toast.duration}ms linear forwards`
                        }}
                    />
                </div>
            )}
        </div>
    )
}

// =============================================================================
// CSS ANIMATIONS - Thêm vào document head
// =============================================================================
const style = document.createElement('style')
style.textContent = `
    /* Animation slide-in từ phải sang trái */
    @keyframes slide-in {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    /* Animation progress bar đếm ngược */
    @keyframes progress {
        from {
            width: 100%;
        }
        to {
            width: 0%;
        }
    }
    
    .animate-slide-in {
        animation: slide-in 0.3s ease-out forwards;
    }
    
    .animate-progress {
        animation: progress 5s linear forwards;
    }
    
    /* Utility class để giới hạn 2 dòng text */
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`
// Thêm styles vào document nếu chưa có
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
    style.id = 'toast-styles'
    document.head.appendChild(style)
}

export default NotificationProvider
