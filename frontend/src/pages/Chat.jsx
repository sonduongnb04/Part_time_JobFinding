/**
 * =============================================================================
 * CHAT.JSX - Trang nhắn tin real-time
 * =============================================================================
 * Trang này bao gồm 2 phần chính:
 * 1. Inbox (Sidebar bên trái): Danh sách các cuộc trò chuyện
 * 2. ChatBox (Phần bên phải): Khung chat với tin nhắn real-time
 * 
 * Tính năng:
 * - Hiển thị danh sách cuộc trò chuyện với avatar, tin nhắn cuối, thời gian
 * - Gửi/nhận tin nhắn real-time qua SignalR
 * - Fallback HTTP nếu SignalR không khả dụng
 * - Hiển thị trạng thái "đang nhập" của người khác
 * - Đánh dấu tin nhắn đã đọc
 * - Responsive design (mobile-friendly)
 * - Tìm kiếm cuộc trò chuyện
 * =============================================================================
 */

// Import React hooks
import { useState, useEffect, useRef, useCallback } from 'react'
// Hook lấy URL params để mở chat với người cụ thể
import { useSearchParams } from 'react-router-dom'
// Import API services
import { chatApi } from '../services/api'
import chatSignalR from '../services/signalr'
// Component Header
import Header from '../components/Header'
// Import icons từ Lucide
import {
    MessageCircle,  // Icon tin nhắn
    Send,           // Icon gửi
    User,           // Icon người dùng
    ArrowLeft,      // Icon quay lại (mobile)
    Circle,         // Icon trạng thái kết nối
    Search,         // Icon tìm kiếm
    MoreVertical,   // Icon menu
    Check,          // Icon đã gửi
    CheckCheck,     // Icon đã đọc
    Loader2         // Icon loading
} from 'lucide-react'

/**
 * Component Chat - Trang nhắn tin chính
 */
const Chat = () => {
    // Lấy URL params (để mở chat với người cụ thể từ trang khác)
    const [searchParams] = useSearchParams()
    const recipientIdParam = searchParams.get('recipientId')  // ID người nhận
    const jobPostIdParam = searchParams.get('jobPostId')      // ID tin tuyển dụng liên quan

    // ==========================================================================
    // STATE MANAGEMENT
    // ==========================================================================

    const [conversations, setConversations] = useState([])        // Danh sách cuộc trò chuyện
    const [selectedConversation, setSelectedConversation] = useState(null)  // Cuộc trò chuyện đang chọn
    const [messages, setMessages] = useState([])                  // Tin nhắn của cuộc trò chuyện hiện tại
    const [newMessage, setNewMessage] = useState('')              // Nội dung tin nhắn đang soạn
    const [loading, setLoading] = useState(true)                  // Đang tải danh sách cuộc trò chuyện
    const [messagesLoading, setMessagesLoading] = useState(false) // Đang tải tin nhắn
    const [sending, setSending] = useState(false)                 // Đang gửi tin nhắn
    const [isConnected, setIsConnected] = useState(false)         // Trạng thái kết nối SignalR
    const [typingUsers, setTypingUsers] = useState({})            // Danh sách user đang gõ {userId: true/false}
    const [searchTerm, setSearchTerm] = useState('')              // Từ khóa tìm kiếm cuộc trò chuyện
    const [showMobileChat, setShowMobileChat] = useState(false)   // Hiển thị chat trên mobile

    // ==========================================================================
    // REFS
    // ==========================================================================

    const messagesEndRef = useRef(null)      // Ref để scroll xuống cuối tin nhắn
    const messageInputRef = useRef(null)     // Ref input tin nhắn để auto-focus
    const typingTimeoutRef = useRef(null)    // Ref timeout cho trạng thái typing

    // ==========================================================================
    // HELPER FUNCTIONS
    // ==========================================================================

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

    const currentUserId = getCurrentUserId()

    // ==========================================================================
    // EFFECTS - Xử lý side effects
    // ==========================================================================

    useEffect(() => {
        // Log để debug selectedConversation
        // console.log('Selected Conversation changed:', selectedConversation?.id);

        // Cập nhật lại listener khi selectedConversation thay đổi
        // Điều này quan trọng để closure trong onMessage nắm bắt được selectedConversation mới nhất
        const unsubMessage = chatSignalR.onMessage((message) => {
            // ... (logic xử lý tin nhắn đã cập nhật ở trên)
            // Tuy nhiên, vì chúng ta đang trong useEffect phụ thuộc vào selectedConversation,
            // chúng ta cần đảm bảo logic này được cập nhật lại.

            // NOTE: Cách tốt hơn là dùng useRef cho selectedConversation hoặc 
            // tách logic xử lý message ra khỏi useEffect phụ thuộc selectedConversation nếu có thể.
            // Nhưng để sửa nhanh, ta sẽ dùng ref cho selectedConversation.
        });

        return () => {
            // unsubMessage(); // Hủy đăng ký cũ
        }
    }, [selectedConversation])

    // GIẢI PHÁP TỐT HƠN: Dùng useRef để lưu selectedConversation hiện tại
    const selectedConversationRef = useRef(null);
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // ...

    /**
     * Effect 1: Kết nối SignalR và đăng ký event listeners
     */
    useEffect(() => {
        const connectSignalR = async () => {
            const connected = await chatSignalR.connect()
            setIsConnected(connected)
        }

        connectSignalR()

        // Đăng ký lắng nghe tin nhắn mới
        const unsubMessage = chatSignalR.onMessage((message) => {
            // Sử dụng Ref để lấy giá trị mới nhất mà không cần re-run effect
            const currentSelectedConv = selectedConversationRef.current;

            console.log('Chat.jsx - Received message:', message);
            console.log('Current conversation:', currentSelectedConv?.id);
            console.log('Message conversationId:', message.conversationId);

            // 1. Cập nhật list Messages nếu đang mở đúng cuộc trò chuyện
            // Chú ý: Đôi khi id có thể là string/number nên dùng == để so sánh lỏng, hoặc ép kiểu
            if (currentSelectedConv && Number(message.conversationId) === Number(currentSelectedConv.id)) {
                console.log('Updating messages state...');
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev
                    return [...prev, message]
                })

                // Đánh dấu đã đọc ngay lập tức nếu đang mở
                if (message.senderId !== currentUserId) {
                    // Gọi API mark read (tùy chọn, để đảm bảo sync)
                    // chatApi.markAsRead(message.conversationId); 
                }
            } else {
                console.log('Not updating messages state. Reason:',
                    !currentSelectedConv ? 'No conversation selected' :
                        `Conversation mismatch: msg=${message.conversationId} vs selected=${currentSelectedConv.id}`
                );
            }

            // 2. Cập nhật danh sách Conversations (Inbox)
            setConversations(prev => prev.map(conv => {
                if (conv.id === message.conversationId) {
                    const isChatOpen = currentSelectedConv?.id === message.conversationId;
                    return {
                        ...conv,
                        lastMessage: message.content,
                        lastMessageAt: message.createdAt,
                        // Tăng unread nếu tin từ người khác VÀ không đang mở chat đó
                        unreadCount: (message.senderId !== currentUserId && !isChatOpen)
                            ? (conv.unreadCount || 0) + 1
                            : (isChatOpen ? 0 : conv.unreadCount) // Reset về 0 nếu đang mở
                    }
                }
                return conv
            }))
        })

        // Đăng ký lắng nghe trạng thái typing
        const unsubTyping = chatSignalR.onTyping((userId, isTyping) => {
            setTypingUsers(prev => ({
                ...prev,
                [userId]: isTyping
            }))
        })

        // Đăng ký lắng nghe thay đổi trạng thái kết nối
        const unsubState = chatSignalR.onConnectionStateChange((state) => {
            setIsConnected(state === 'connected')
        })

        // Cleanup: Hủy đăng ký khi component unmount
        return () => {
            unsubMessage()
            unsubTyping()
            unsubState()
        }
    }, [currentUserId])

    /**
     * Effect 2: Tải danh sách cuộc trò chuyện khi component mount
     */
    useEffect(() => {
        loadConversations()
    }, [])

    /**
     * Effect 3: Mở chat với người cụ thể nếu có URL params
     * VD: /chat?recipientId=123&jobPostId=456
     */
    useEffect(() => {
        if (recipientIdParam && !loading) {
            openOrCreateConversation(parseInt(recipientIdParam), jobPostIdParam ? parseInt(jobPostIdParam) : null)
        }
    }, [recipientIdParam, jobPostIdParam, loading])

    /**
     * Effect 4: Tự động scroll xuống cuối khi có tin nhắn mới
     */
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    /**
     * Effect 5: Tham gia/rời khỏi group SignalR khi chọn cuộc trò chuyện
     * (Tạm tắt vì server không hỗ trợ method Join/LeaveConversation)
     */
    /*
    useEffect(() => {
        if (selectedConversation) {
            // Tham gia group để nhận tin nhắn real-time
            chatSignalR.joinConversation(selectedConversation.id)
            return () => {
                // Rời group khi chọn cuộc trò chuyện khác
                chatSignalR.leaveConversation(selectedConversation.id)
            }
        }
    }, [selectedConversation?.id])
    */

    // ==========================================================================
    // API FUNCTIONS - Gọi API
    // ==========================================================================

    /**
     * Tải danh sách cuộc trò chuyện
     */
    const loadConversations = async () => {
        try {
            setLoading(true)
            const response = await chatApi.getConversations()
            if (response.data.success) {
                setConversations(response.data.data.items || [])
            }
        } catch (error) {
            console.error('Không thể tải danh sách cuộc trò chuyện:', error)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Tải tin nhắn của một cuộc trò chuyện
     * @param {number} conversationId - ID cuộc trò chuyện
     */
    const loadMessages = async (conversationId) => {
        try {
            setMessagesLoading(true)
            const response = await chatApi.getMessages(conversationId)
            if (response.data.success) {
                setMessages(response.data.data.items || [])
            }
        } catch (error) {
            console.error('Không thể tải tin nhắn:', error)
        } finally {
            setMessagesLoading(false)
        }
    }

    /**
     * Mở hoặc tạo cuộc trò chuyện mới với một người
     * @param {number} recipientId - ID người nhận
     * @param {number|null} jobPostId - ID tin tuyển dụng (tùy chọn)
     */
    const openOrCreateConversation = async (recipientId, jobPostId) => {
        try {
            const response = await chatApi.getOrCreateConversation(recipientId, jobPostId)
            if (response.data.success) {
                const conv = response.data.data
                setSelectedConversation(conv)
                await loadMessages(conv.id)

                // Thêm vào danh sách nếu chưa có
                setConversations(prev => {
                    if (!prev.some(c => c.id === conv.id)) {
                        return [conv, ...prev]
                    }
                    return prev
                })

                setShowMobileChat(true)
            }
        } catch (error) {
            console.error('Không thể mở cuộc trò chuyện:', error)
        }
    }

    /**
     * Chọn một cuộc trò chuyện từ danh sách
     * @param {Object} conversation - Đối tượng cuộc trò chuyện
     */
    const selectConversation = async (conversation) => {
        setSelectedConversation(conversation)
        await loadMessages(conversation.id)
        setShowMobileChat(true)

        // Đánh dấu đã đọc nếu có tin nhắn chưa đọc
        if (conversation.unreadCount > 0) {
            try {
                await chatApi.markAsRead(conversation.id)
                chatSignalR.markAsRead(conversation.id)
                // Cập nhật state local
                setConversations(prev => prev.map(conv =>
                    conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
                ))
            } catch (error) {
                console.error('Không thể đánh dấu đã đọc:', error)
            }
        }

        // Focus vào input tin nhắn
        messageInputRef.current?.focus()
    }

    /**
     * Scroll xuống cuối danh sách tin nhắn
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    /**
     * Xử lý gửi tin nhắn
     * @param {Event} e - Form submit event
     */
    const handleSendMessage = async (e) => {
        e.preventDefault()
        // Validate
        if (!newMessage.trim() || !selectedConversation || sending) return

        const messageContent = newMessage.trim()
        setNewMessage('')  // Clear input ngay lập tức
        setSending(true)

        try {
            // Lấy thông tin người nhận
            const otherUser = getOtherUser(selectedConversation)

            // Thử gửi qua SignalR trước (real-time)
            const sent = await chatSignalR.sendMessage({
                conversationId: selectedConversation.id,
                content: messageContent,
                recipientId: otherUser.id
            })

            // Fallback: Gửi qua HTTP nếu SignalR không hoạt động
            if (!sent) {
                const response = await chatApi.sendMessage({
                    conversationId: selectedConversation.id,
                    content: messageContent
                })
                if (response.data.success) {
                    setMessages(prev => [...prev, response.data.data])
                }
            }
        } catch (error) {
            console.error('Không thể gửi tin nhắn:', error)
            setNewMessage(messageContent) // Khôi phục tin nhắn nếu lỗi
        } finally {
            setSending(false)
        }
    }

    /**
     * Xử lý trạng thái "đang gõ"
     * Gửi thông báo typing và tự động tắt sau 2 giây
     */
    const handleTyping = useCallback(() => {
        if (!selectedConversation) return

        // Gửi trạng thái đang gõ
        chatSignalR.updateTyping(selectedConversation.id, true)

        // Xóa timeout cũ
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Tự động tắt trạng thái typing sau 2 giây không gõ
        typingTimeoutRef.current = setTimeout(() => {
            chatSignalR.updateTyping(selectedConversation.id, false)
        }, 2000)
    }, [selectedConversation])

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================

    /**
     * Format thời gian tin nhắn
     * @param {string} dateString - Chuỗi thời gian ISO
     * @returns {string} Thời gian đã format (HH:mm nếu hôm nay, DD/MM nếu ngày khác)
     */
    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()

        if (isToday) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }

    /**
     * Lấy thông tin người còn lại trong cuộc trò chuyện
     * @param {Object} conversation - Cuộc trò chuyện
     * @returns {Object} {name, id} của người còn lại (không phải mình)
     */
    const getOtherUser = (conversation) => {
        if (!conversation) return { name: '', id: 0 }
        // Nếu mình là employer thì người kia là student, ngược lại
        const isEmployer = conversation.employerId === currentUserId
        return {
            name: isEmployer ? conversation.studentName : conversation.employerName,
            id: isEmployer ? conversation.studentId : conversation.employerId
        }
    }

    /**
     * Lọc danh sách cuộc trò chuyện theo từ khóa tìm kiếm
     */
    const filteredConversations = conversations.filter(conv => {
        if (!searchTerm) return true
        const otherUser = getOtherUser(conv)
        return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (conv.jobPostTitle && conv.jobPostTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    })

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header chung */}
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Trạng thái kết nối SignalR */}
                <div className="mb-4 flex items-center gap-2">
                    <Circle className={`h-3 w-3 ${isConnected ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
                    <span className="text-sm text-gray-500">
                        {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
                    </span>
                </div>

                {/* Container chính - 2 cột */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex h-[calc(100vh-180px)]">

                    {/* ============================================ */}
                    {/* CỘT TRÁI: INBOX - Danh sách cuộc trò chuyện */}
                    {/* ============================================ */}
                    <div className={`w-full md:w-96 border-r border-gray-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>

                        {/* Header Inbox với ô tìm kiếm */}
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageCircle className="h-6 w-6 text-primary-600" />
                                Tin nhắn
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm cuộc trò chuyện..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Danh sách cuộc trò chuyện */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                // Loading state
                                <div className="flex justify-center items-center h-32">
                                    <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                // Empty state
                                <div className="p-8 text-center text-gray-500">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>Chưa có cuộc trò chuyện nào</p>
                                </div>
                            ) : (
                                // Danh sách các cuộc trò chuyện
                                filteredConversations.map(conversation => {
                                    const otherUser = getOtherUser(conversation)
                                    const isSelected = selectedConversation?.id === conversation.id

                                    return (
                                        <div
                                            key={conversation.id}
                                            onClick={() => selectConversation(conversation)}
                                            className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div className="relative flex-shrink-0">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md">
                                                        {otherUser.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {/* Badge số tin chưa đọc */}
                                                    {conversation.unreadCount > 0 && (
                                                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                                                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Nội dung cuộc trò chuyện */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className={`font-semibold text-gray-900 truncate ${conversation.unreadCount > 0 ? 'font-bold' : ''}`}>
                                                            {otherUser.name}
                                                        </h3>
                                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                            {formatTime(conversation.lastMessageAt)}
                                                        </span>
                                                    </div>
                                                    {/* Tiêu đề tin tuyển dụng liên quan */}
                                                    {conversation.jobPostTitle && (
                                                        <p className="text-xs text-primary-600 truncate mt-0.5">
                                                            {conversation.jobPostTitle}
                                                        </p>
                                                    )}
                                                    {/* Tin nhắn cuối */}
                                                    <p className={`text-sm truncate mt-1 ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                                                        }`}>
                                                        {conversation.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* CỘT PHẢI: CHAT BOX - Khung chat */}
                    {/* ============================================ */}
                    <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                        {selectedConversation ? (
                            <>
                                {/* Header của khung chat */}
                                <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
                                    {/* Nút quay lại (chỉ hiển thị trên mobile) */}
                                    <button
                                        onClick={() => setShowMobileChat(false)}
                                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                                    </button>

                                    {/* Avatar người nhận */}
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow">
                                        {getOtherUser(selectedConversation).name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Thông tin người nhận */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {getOtherUser(selectedConversation).name}
                                        </h3>
                                        {selectedConversation.jobPostTitle && (
                                            <p className="text-xs text-gray-500">{selectedConversation.jobPostTitle}</p>
                                        )}
                                        {/* Hiển thị "Đang nhập..." nếu người kia đang gõ */}
                                        {typingUsers[getOtherUser(selectedConversation).id] && (
                                            <p className="text-xs text-primary-600 animate-pulse">Đang nhập...</p>
                                        )}
                                    </div>

                                    {/* Menu button */}
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <MoreVertical className="h-5 w-5 text-gray-600" />
                                    </button>
                                </div>

                                {/* Vùng hiển thị tin nhắn */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {messagesLoading ? (
                                        // Loading state
                                        <div className="flex justify-center items-center h-full">
                                            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        // Empty state
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
                                            <p>Bắt đầu cuộc trò chuyện</p>
                                        </div>
                                    ) : (
                                        // Danh sách tin nhắn
                                        messages.map((message, index) => {
                                            const isMine = message.senderId === currentUserId  // Tin của mình?
                                            // Hiển thị avatar nếu tin nhắn đầu hoặc người gửi khác tin trước
                                            const showAvatar = !isMine && (index === 0 || messages[index - 1]?.senderId !== message.senderId)

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`flex items-end gap-2 max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                                                        {/* Avatar người gửi (chỉ hiển thị cho tin của người khác) */}
                                                        {!isMine && (
                                                            <div className={`flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-semibold">
                                                                    {message.senderName?.charAt(0).toUpperCase()}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Bubble tin nhắn */}
                                                        <div className={`group relative`}>
                                                            <div className={`px-4 py-2.5 rounded-2xl ${isMine
                                                                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md'
                                                                : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                                                                }`}>
                                                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                                            </div>
                                                            {/* Thời gian và trạng thái đã đọc */}
                                                            <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                                <span className="text-xs text-gray-400">
                                                                    {formatTime(message.createdAt)}
                                                                </span>
                                                                {/* Icon trạng thái: Check = đã gửi, CheckCheck = đã đọc */}
                                                                {isMine && (
                                                                    message.isRead
                                                                        ? <CheckCheck className="h-3.5 w-3.5 text-primary-500" />
                                                                        : <Check className="h-3.5 w-3.5 text-gray-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                    {/* Ref để scroll xuống cuối */}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Form nhập tin nhắn */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                                    <div className="flex items-center gap-3">
                                        <input
                                            ref={messageInputRef}
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value)
                                                handleTyping()  // Gửi trạng thái đang gõ
                                            }}
                                            placeholder="Nhập tin nhắn..."
                                            className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="p-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30"
                                        >
                                            {sending ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Send className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            /* Trạng thái chưa chọn cuộc trò chuyện nào */
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                                    <div className="h-20 w-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                                        <MessageCircle className="h-10 w-10 text-primary-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Tin nhắn của bạn</h3>
                                    <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat
