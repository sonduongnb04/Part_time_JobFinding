/**
 * =============================================================================
 * SIGNALR SERVICE - Dịch vụ kết nối real-time
 * =============================================================================
 * File này quản lý kết nối SignalR đến server để nhận/gửi tin nhắn real-time.
 * 
 * Tính năng:
 * - Kết nối tự động đến SignalR Hub
 * - Tự động reconnect khi mất kết nối
 * - Gửi/nhận tin nhắn real-time
 * - Theo dõi trạng thái typing
 * - Đánh dấu tin nhắn đã đọc
 * 
 * Sử dụng CDN SignalR thay vì npm package để giảm kích thước bundle
 * =============================================================================
 */

// Lấy URL API từ biến môi trường
// Dùng relative path để đi qua Vite proxy (giống REST API)
const API_BASE_URL = import.meta.env.VITE_API_URL || ''
// URL của SignalR Hub cho chat
const HUB_URL = `${API_BASE_URL}/hubs/chat`

/**
 * Class quản lý kết nối SignalR cho Chat
 * Sử dụng pattern Singleton - chỉ có 1 instance duy nhất
 */
class ChatSignalRService {
    constructor() {
        // Connection object của SignalR
        this.connection = null
        // Promise đang kết nối (tránh kết nối trùng lặp)
        this.connectionPromise = null

        // Danh sách callback khi nhận tin nhắn mới
        this.messageCallbacks = []
        // Danh sách callback khi có người đang gõ
        this.typingCallbacks = []
        // Danh sách callback khi tin nhắn được đọc
        this.readCallbacks = []
        // Danh sách callback khi có lỗi
        this.errorCallbacks = []
        // Danh sách callback khi trạng thái kết nối thay đổi
        this.connectionStateCallbacks = []
    }

    /**
     * Load thư viện SignalR từ CDN
     * Kiểm tra nếu đã load rồi thì không load lại
     * @returns {Promise} SignalR library
     */
    async loadSignalR() {
        // Nếu đã load rồi, trả về luôn
        if (window.signalR) {
            return window.signalR
        }

        // Tạo script tag và load từ CDN
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.0/signalr.min.js'
            script.onload = () => resolve(window.signalR)
            script.onerror = () => reject(new Error('Không thể load thư viện SignalR'))
            document.head.appendChild(script)
        })
    }

    /**
     * Kết nối đến SignalR Hub
     * Nếu đang kết nối thì trả về promise hiện tại
     * @returns {Promise<boolean>} Kết nối thành công hay không
     */
    async connect() {
        // Nếu đang có promise kết nối, trả về luôn (tránh kết nối trùng)
        if (this.connectionPromise) {
            return this.connectionPromise
        }

        this.connectionPromise = this._connect()
        return this.connectionPromise
    }

    /**
     * Thực hiện kết nối thực sự đến SignalR Hub
     * @private
     * @returns {Promise<boolean>} Kết nối thành công hay không
     */
    async _connect() {
        // Kiểm tra có token không - phải đăng nhập mới kết nối được
        const token = localStorage.getItem('accessToken')
        if (!token) {
            console.warn('Chưa đăng nhập, không thể kết nối đến chat hub')
            return false
        }

        try {
            // Load thư viện SignalR
            const signalR = await this.loadSignalR()

            // Tạo connection với cấu hình
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(HUB_URL, {
                    // Gửi token để xác thực
                    accessTokenFactory: () => localStorage.getItem('accessToken')
                })
                // Tự động reconnect với thời gian chờ tăng dần
                .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
                // Bật logging để debug
                .configureLogging(signalR.LogLevel.Information)
                .build()

            // =================================================================
            // ĐĂNG KÝ CÁC EVENT HANDLERS
            // =================================================================

            // Nhận tin nhắn mới
            this.connection.on('ReceiveMessage', (message) => {
                console.log('Nhận tin nhắn:', message)
                // Gọi tất cả callbacks đã đăng ký
                this.messageCallbacks.forEach(cb => cb(message))
            })

            // Nhận thông báo có người đang gõ
            this.connection.on('UserTyping', (userId, isTyping) => {
                this.typingCallbacks.forEach(cb => cb(userId, isTyping))
            })

            // Nhận thông báo tin nhắn đã được đọc
            this.connection.on('MessagesMarkedAsRead', (conversationId) => {
                this.readCallbacks.forEach(cb => cb(conversationId))
            })

            // Nhận thông báo lỗi từ server
            this.connection.on('Error', (error) => {
                console.error('Lỗi SignalR:', error)
                this.errorCallbacks.forEach(cb => cb(error))
            })

            // =================================================================
            // XỬ LÝ TRẠNG THÁI KẾT NỐI
            // =================================================================

            // Đang thử kết nối lại
            this.connection.onreconnecting((error) => {
                console.log('SignalR đang kết nối lại:', error)
                this.connectionStateCallbacks.forEach(cb => cb('reconnecting'))
            })

            // Đã kết nối lại thành công
            this.connection.onreconnected((connectionId) => {
                console.log('SignalR đã kết nối lại:', connectionId)
                this.connectionStateCallbacks.forEach(cb => cb('connected'))
            })

            // Kết nối bị đóng
            this.connection.onclose((error) => {
                console.log('SignalR đã đóng:', error)
                this.connectionPromise = null
                this.connectionStateCallbacks.forEach(cb => cb('disconnected'))
            })

            // Bắt đầu kết nối
            await this.connection.start()
            console.log('SignalR đã kết nối thành công!')
            this.connectionStateCallbacks.forEach(cb => cb('connected'))
            return true

        } catch (error) {
            console.error('Lỗi kết nối SignalR:', error)
            this.connectionPromise = null
            return false
        }
    }

    /**
     * Ngắt kết nối SignalR
     */
    async disconnect() {
        if (this.connection) {
            await this.connection.stop()
            this.connection = null
            this.connectionPromise = null
        }
    }

    /**
     * Gửi tin nhắn qua SignalR
     * @param {Object} dto - Dữ liệu tin nhắn {conversationId, content, recipientId}
     * @returns {Promise<boolean>} Gửi thành công hay không
     */
    async sendMessage(dto) {
        // Kiểm tra có đang kết nối không
        if (!this.connection || this.connection.state !== 'Connected') {
            console.warn('Chưa kết nối đến SignalR hub')
            return false
        }

        try {
            // Gọi method SendMessage trên server
            await this.connection.invoke('SendMessage', dto)
            return true
        } catch (error) {
            console.error('Không thể gửi tin nhắn:', error)
            return false
        }
    }

    /**
     * Tham gia vào một cuộc trò chuyện (để nhận tin nhắn real-time)
     * @param {number} conversationId - ID cuộc trò chuyện
     */
    async joinConversation(conversationId) {
        if (!this.connection || this.connection.state !== 'Connected') {
            return false
        }

        try {
            await this.connection.invoke('JoinConversation', conversationId)
            return true
        } catch (error) {
            console.error('Không thể tham gia cuộc trò chuyện:', error)
            return false
        }
    }

    /**
     * Rời khỏi cuộc trò chuyện
     * @param {number} conversationId - ID cuộc trò chuyện
     */
    async leaveConversation(conversationId) {
        if (!this.connection || this.connection.state !== 'Connected') {
            return false
        }

        try {
            await this.connection.invoke('LeaveConversation', conversationId)
            return true
        } catch (error) {
            console.error('Không thể rời cuộc trò chuyện:', error)
            return false
        }
    }

    /**
     * Đánh dấu tất cả tin nhắn đã đọc
     * @param {number} conversationId - ID cuộc trò chuyện
     */
    async markAsRead(conversationId) {
        if (!this.connection || this.connection.state !== 'Connected') {
            return false
        }

        try {
            await this.connection.invoke('MarkAsRead', conversationId)
            return true
        } catch (error) {
            console.error('Không thể đánh dấu đã đọc:', error)
            return false
        }
    }

    /**
     * Cập nhật trạng thái đang gõ
     * @param {number} conversationId - ID cuộc trò chuyện
     * @param {boolean} isTyping - Đang gõ hay không
     */
    async updateTyping(conversationId, isTyping) {
        if (!this.connection || this.connection.state !== 'Connected') {
            return false
        }

        try {
            await this.connection.invoke('UpdateTyping', conversationId, isTyping)
            return true
        } catch (error) {
            console.error('Không thể cập nhật trạng thái typing:', error)
            return false
        }
    }

    // =========================================================================
    // CÁC PHƯƠNG THỨC ĐĂNG KÝ CALLBACK
    // Mỗi phương thức trả về hàm unsubscribe để hủy đăng ký
    // =========================================================================

    /**
     * Đăng ký callback khi nhận tin nhắn mới
     * @param {Function} callback - Hàm xử lý khi nhận tin
     * @returns {Function} Hàm hủy đăng ký
     */
    onMessage(callback) {
        this.messageCallbacks.push(callback)
        // Trả về hàm để hủy đăng ký
        return () => {
            this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback)
        }
    }

    /**
     * Đăng ký callback khi có người đang gõ
     * @param {Function} callback - Hàm xử lý (userId, isTyping)
     * @returns {Function} Hàm hủy đăng ký
     */
    onTyping(callback) {
        this.typingCallbacks.push(callback)
        return () => {
            this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback)
        }
    }

    /**
     * Đăng ký callback khi tin nhắn được đọc
     * @param {Function} callback - Hàm xử lý (conversationId)
     * @returns {Function} Hàm hủy đăng ký
     */
    onRead(callback) {
        this.readCallbacks.push(callback)
        return () => {
            this.readCallbacks = this.readCallbacks.filter(cb => cb !== callback)
        }
    }

    /**
     * Đăng ký callback khi có lỗi
     * @param {Function} callback - Hàm xử lý lỗi
     * @returns {Function} Hàm hủy đăng ký
     */
    onError(callback) {
        this.errorCallbacks.push(callback)
        return () => {
            this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback)
        }
    }

    /**
     * Đăng ký callback khi trạng thái kết nối thay đổi
     * @param {Function} callback - Hàm xử lý (state: 'connected'|'disconnected'|'reconnecting')
     * @returns {Function} Hàm hủy đăng ký
     */
    onConnectionStateChange(callback) {
        this.connectionStateCallbacks.push(callback)
        return () => {
            this.connectionStateCallbacks = this.connectionStateCallbacks.filter(cb => cb !== callback)
        }
    }

    /**
     * Kiểm tra trạng thái kết nối
     * @returns {boolean} Có đang kết nối hay không
     */
    isConnected() {
        return this.connection && this.connection.state === 'Connected'
    }
}

// Tạo singleton instance - chỉ có 1 instance duy nhất trong toàn ứng dụng
const chatSignalR = new ChatSignalRService()
export default chatSignalR
