/**
 * =============================================================================
 * CHAT LISTENER - Lắng nghe tin nhắn mới toàn cục
 * =============================================================================
 * Component này chạy ở level App để lắng nghe tất cả tin nhắn mới
 * từ SignalR và hiển thị thông báo cho người dùng.
 * 
 * Tính năng:
 * - Kết nối SignalR khi user đăng nhập
 * - Hiển thị Toast notification khi có tin nhắn mới
 * - Phát âm thanh thông báo
 * - Hiển thị Browser notification (nếu được phép)
 * - Cập nhật tiêu đề trang với số tin chưa đọc
 * 
 * Lưu ý: Component này không render gì ra UI (return null)
 * =============================================================================
 */

import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import chatSignalR from '../services/signalr'
import { useNotification } from './NotificationProvider'

/**
 * ChatListener - Component lắng nghe tin nhắn mới toàn cục
 * Được đặt ở App.jsx để chạy xuyên suốt ứng dụng
 */
const ChatListener = () => {
    const navigate = useNavigate()      // Hook điều hướng
    const location = useLocation()      // Hook lấy URL hiện tại
    const { showMessage } = useNotification()  // Hook hiển thị toast
    const audioRef = useRef(null)       // Ref cho audio element

    /**
     * Lấy ID người dùng hiện tại từ JWT token
     * @returns {number|null} User ID hoặc null nếu chưa đăng nhập
     */
    const getCurrentUserId = () => {
        const token = localStorage.getItem('accessToken')
        if (!token) return null
        try {
            // Decode JWT payload (phần giữa của token)
            const payload = JSON.parse(atob(token.split('.')[1]))
            return parseInt(payload.nameid || payload.sub)
        } catch {
            return null
        }
    }

    /**
     * Effect: Kết nối SignalR và lắng nghe tin nhắn mới
     */
    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        // Không làm gì nếu chưa đăng nhập
        if (!token) return

        const connectAndListen = async () => {
            // Kết nối đến SignalR Hub
            await chatSignalR.connect()

            // Đăng ký lắng nghe tin nhắn mới
            const unsubMessage = chatSignalR.onMessage((message) => {
                const currentUserId = getCurrentUserId()

                // Chỉ hiển thị thông báo nếu:
                // 1. Tin nhắn từ người khác (không phải mình gửi)
                // 2. Có thể bổ sung: không đang ở trang chat của conversation đó
                if (message.senderId !== currentUserId) {
                    // Kiểm tra có đang ở trang chat không (để tùy chỉnh behavior)
                    const isOnChatPage = location.pathname === '/chat'

                    // Hiển thị Toast notification
                    showMessage({
                        title: message.senderName || 'Tin nhắn mới',
                        description: message.content,
                        avatar: message.senderName?.charAt(0).toUpperCase(),
                        time: 'Vừa xong',
                        // Click vào toast → chuyển đến conversation
                        onClick: () => {
                            navigate(`/chat?conversationId=${message.conversationId}`)
                        }
                    })

                    // Phát âm thanh thông báo
                    playNotificationSound()

                    // Hiển thị Browser notification (nếu được phép)
                    showBrowserNotification(message)

                    // Cập nhật tiêu đề trang với số tin chưa đọc
                    updatePageTitle()
                }
            })

            // Cleanup function - hủy subscription khi component unmount
            return () => {
                unsubMessage()
            }
        }

        connectAndListen()
    }, [location.pathname, showMessage, navigate])

    /**
     * Phát âm thanh thông báo sử dụng Web Audio API
     * Tạo tiếng beep ngắn với tần số 800Hz
     */
    const playNotificationSound = () => {
        try {
            // Tạo Audio Context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()

            // Tạo oscillator (tạo sóng âm)
            const oscillator = audioContext.createOscillator()
            // Tạo gain node (điều chỉnh âm lượng)
            const gainNode = audioContext.createGain()

            // Kết nối: oscillator → gainNode → speakers
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            // Cấu hình âm thanh
            oscillator.frequency.value = 800  // Tần số 800Hz
            oscillator.type = 'sine'          // Dạng sóng sine (mềm mại)

            // Fade out âm lượng
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)  // Bắt đầu 30%
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)  // Giảm dần

            // Phát trong 0.3 giây
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.3)
        } catch (error) {
            console.log('Không thể phát âm thanh thông báo:', error)
        }
    }

    /**
     * Hiển thị Browser Notification (thông báo hệ thống)
     * Yêu cầu người dùng cấp quyền nếu chưa có
     * @param {Object} message - Tin nhắn mới
     */
    const showBrowserNotification = async (message) => {
        // Kiểm tra trình duyệt có hỗ trợ Notification không
        if (!('Notification' in window)) return

        // Nếu đã được cấp quyền → hiển thị notification
        if (Notification.permission === 'granted') {
            new Notification(message.senderName || 'Tin nhắn mới', {
                body: message.content,           // Nội dung tin nhắn
                icon: '/favicon.ico',            // Icon hiển thị
                tag: `message-${message.id}`,    // Tag để gộp notification trùng
                requireInteraction: false        // Tự động đóng
            })
        }
        // Nếu chưa hỏi → xin quyền
        else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
                new Notification(message.senderName || 'Tin nhắn mới', {
                    body: message.content,
                    icon: '/favicon.ico',
                    tag: `message-${message.id}`
                })
            }
        }
    }

    /**
     * Cập nhật tiêu đề trang với số tin chưa đọc
     * VD: "(3) MyJob - Việc làm" 
     */
    const updatePageTitle = () => {
        // Lấy tiêu đề gốc (loại bỏ số tin chưa đọc nếu có)
        const originalTitle = document.title.replace(/^\(\d+\) /, '')

        // Đếm số tin hiện tại trong title
        const match = document.title.match(/^\((\d+)\) /)
        const currentCount = match ? parseInt(match[1]) : 0

        // Cập nhật title với số mới
        document.title = `(${currentCount + 1}) ${originalTitle}`
    }

    // Component này không render gì ra UI
    return null
}

export default ChatListener
