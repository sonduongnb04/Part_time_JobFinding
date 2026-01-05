# 📋 HƯỚNG DẪN TEST ĐẦY ĐỦ CHỨC NĂNG DỰ ÁN
## Part-Time Jobs Search Platform

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-01-02  
> **Mục đích:** Tài liệu hướng dẫn test toàn bộ chức năng của hệ thống

---

## 📑 MỤC LỤC

1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Test Authentication](#2-test-authentication)
3. [Test Quản lý Công ty](#3-test-quản-lý-công-ty)
4. [Test Tin tuyển dụng](#4-test-tin-tuyển-dụng)
5. [Test Ứng tuyển](#5-test-ứng-tuyển)
6. [Test Profile ứng viên](#6-test-profile-ứng-viên)
7. [Test Chat Real-time](#7-test-chat-real-time)
8. [Test Admin Functions](#8-test-admin-functions)
9. [Test API với Postman](#9-test-api-với-postman)
10. [Checklist tổng hợp](#10-checklist-tổng-hợp)

---

## 1. CHUẨN BỊ MÔI TRƯỜNG

### 1.1 Khởi động Backend
```powershell
cd F:\Backend_PartTimeJobs-search\PTJ.API
dotnet run
```
> Backend sẽ chạy tại: `https://localhost:7204` hoặc `http://localhost:5000`

### 1.2 Khởi động Frontend
```powershell
cd F:\Backend_PartTimeJobs-search\frontend
npm run dev
```
> Frontend sẽ chạy tại: `http://localhost:5173`

### 1.3 Kiểm tra Database
- Mở SQL Server Management Studio
- Kết nối đến database `PartTimeJobsDB`
- Đảm bảo có dữ liệu seed (nếu cần)

### 1.4 Tài khoản test
| Role | Email | Password | Ghi chú |
|------|-------|----------|---------|
| Admin | admin@ptj.com | Admin@123 | Tài khoản quản trị |
| Employer | employer@test.com | Employer@123 | Nhà tuyển dụng |
| Student | student@test.com | Student@123 | Ứng viên |

---

## 2. TEST AUTHENTICATION

### 2.1 Đăng ký tài khoản mới

#### Test Case 2.1.1: Đăng ký thành công
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/register` | Hiển thị form đăng ký |
| 2 | Nhập thông tin hợp lệ (tên, email, password, confirm password) | Các field được điền |
| 3 | Chọn loại tài khoản (Employer/Student) | Radio button được chọn |
| 4 | Click "Đăng ký" | Chuyển đến `/login` với thông báo thành công |

#### Test Case 2.1.2: Validation lỗi
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Để trống các field bắt buộc | Hiển thị lỗi "Vui lòng nhập..." |
| 2 | Nhập email không đúng format | Hiển thị lỗi "Email không hợp lệ" |
| 3 | Password < 8 ký tự | Hiển thị lỗi độ dài password |
| 4 | Confirm password không khớp | Hiển thị lỗi "Mật khẩu không khớp" |
| 5 | Email đã tồn tại | Hiển thị lỗi từ API |

### 2.2 Đăng nhập

#### Test Case 2.2.1: Đăng nhập thành công
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/login` | Hiển thị form đăng nhập |
| 2 | Nhập email và password đúng | Các field được điền |
| 3 | Click "Đăng nhập" | Chuyển đến trang phù hợp với role |
| 4 | Kiểm tra localStorage | Có `accessToken`, `refreshToken`, `user` |

#### Test Case 2.2.2: Đăng nhập thất bại
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Nhập sai email hoặc password | Hiển thị lỗi "Email hoặc mật khẩu không đúng" |
| 2 | Để trống field | Hiển thị validation error |

### 2.3 Đăng xuất

#### Test Case 2.3.1: Đăng xuất thành công
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click nút "Đăng xuất" | Chuyển đến `/login` |
| 2 | Kiểm tra localStorage | Không còn tokens |
| 3 | Truy cập route protected | Redirect về `/login` |

### 2.4 Quên mật khẩu

#### Test Case 2.4.1: Gửi email reset
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/forgot-password` | Hiển thị form nhập email |
| 2 | Nhập email hợp lệ | Field được điền |
| 3 | Click "Gửi link reset" | Hiển thị thông báo đã gửi email |

---

## 3. TEST QUẢN LÝ CÔNG TY

### 3.1 Tạo hồ sơ công ty

#### Điều kiện: Đăng nhập với tài khoản Employer

#### Test Case 3.1.1: Tạo công ty mới
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/employer-profile` | Hiển thị form tạo công ty |
| 2 | Điền đầy đủ thông tin | Các field được điền |
| 3 | Click "Lưu thay đổi" | Hiển thị thông báo thành công |
| 4 | Refresh trang | Dữ liệu vẫn còn |

### 3.2 Cập nhật hồ sơ công ty

#### Test Case 3.2.1: Cập nhật thành công
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/employer-profile` | Hiển thị form với dữ liệu hiện tại |
| 2 | Thay đổi một số field | Field được cập nhật |
| 3 | Click "Lưu thay đổi" | Hiển thị thông báo thành công |

---

## 4. TEST TIN TUYỂN DỤNG

### 4.1 Đăng tin mới

#### Điều kiện: Đăng nhập Employer, đã có công ty được duyệt

#### Test Case 4.1.1: Đăng tin thành công
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/post-job` | Hiển thị form đăng tin |
| 2 | Điền đầy đủ thông tin bắt buộc | Các field được điền |
| 3 | Chọn ngày hết hạn | Date picker hoạt động |
| 4 | Click "Đăng tin" | Chuyển đến `/my-jobs` với thông báo thành công |

#### Test Case 4.1.2: Validation
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Để trống tiêu đề | Hiển thị lỗi |
| 2 | Nhập lương min > max | Hiển thị lỗi |
| 3 | Chọn ngày hết hạn trong quá khứ | Hiển thị lỗi |

### 4.2 Xem danh sách tin

#### Test Case 4.2.1: Xem tin của tôi
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/my-jobs` | Hiển thị danh sách tin đã đăng |
| 2 | Kiểm tra thông tin từng tin | Hiển thị tiêu đề, mô tả, trạng thái, số ứng viên |

### 4.3 Sửa tin

#### Test Case 4.3.1: Sửa tin thành công
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Sửa tin" trên một tin | Chuyển đến `/edit-job/:id` |
| 2 | Thay đổi thông tin | Field được cập nhật |
| 3 | Click "Cập nhật" | Quay lại `/my-jobs` với thông báo thành công |

### 4.4 Ẩn/Hiện tin

#### Test Case 4.4.1: Ẩn tin
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Ẩn tin" trên tin đang Active | Hiển thị confirm |
| 2 | Xác nhận | Tin chuyển sang trạng thái "Đã ẩn" |
| 3 | Tìm kiếm tin trên `/jobs` | Không thấy tin này |

### 4.5 Xóa tin

#### Test Case 4.5.1: Xóa tin
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Xóa tin" | Hiển thị confirm |
| 2 | Xác nhận | Tin bị xóa khỏi danh sách |

### 4.6 Tìm kiếm tin (Public)

#### Test Case 4.6.1: Tìm kiếm việc làm
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/jobs` | Hiển thị danh sách việc làm |
| 2 | Nhập từ khóa tìm kiếm | Kết quả được lọc |
| 3 | Nhập địa điểm | Kết quả được lọc theo location |
| 4 | Click vào một tin | Chuyển đến trang chi tiết |

---

## 5. TEST ỨNG TUYỂN

### 5.1 Ứng tuyển việc làm

#### Điều kiện: Đăng nhập với tài khoản Student

#### Test Case 5.1.1: Ứng tuyển thành công
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập chi tiết một tin tuyển dụng | Hiển thị thông tin tin và nút "Ứng tuyển" |
| 2 | Click "Ứng tuyển" | Hiển thị form ứng tuyển |
| 3 | Viết cover letter | Field được điền |
| 4 | Upload CV (nếu có) | File được chọn |
| 5 | Click "Gửi ứng tuyển" | Hiển thị thông báo thành công |

### 5.2 Xem danh sách ứng viên (Employer)

#### Test Case 5.2.1: Xem ứng viên
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/my-jobs` | Hiển thị danh sách tin với số ứng viên |
| 2 | Click "Xem ứng viên" | Chuyển đến `/jobs/:id/applications` |
| 3 | Xem danh sách | Hiển thị tên, ngày ứng tuyển, trạng thái |

### 5.3 Cập nhật trạng thái ứng viên

#### Test Case 5.3.1: Mời phỏng vấn
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click vào một ứng viên | Hiển thị chi tiết ứng viên |
| 2 | Click "Phỏng vấn" | Trạng thái chuyển sang "Interview" |

#### Test Case 5.3.2: Tuyển dụng
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Tuyển" | Trạng thái chuyển sang "Hired" |

#### Test Case 5.3.3: Từ chối
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Từ chối" | Trạng thái chuyển sang "Rejected" |

### 5.4 Xem hồ sơ ứng viên

#### Test Case 5.4.1: Xem profile
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Xem hồ sơ đầy đủ" | Mở modal hồ sơ |
| 2 | Xem thông tin | Hiển thị skills, experience, education |
| 3 | Đóng modal | Modal đóng |

---

## 6. TEST PROFILE ỨNG VIÊN

### 6.1 Tạo/Cập nhật Profile

#### Điều kiện: Đăng nhập với tài khoản Student

#### Test Case 6.1.1: Cập nhật thông tin cơ bản
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập trang profile | Hiển thị form profile |
| 2 | Cập nhật headline, bio | Field được cập nhật |
| 3 | Click "Lưu" | Thông báo thành công |

### 6.2 Quản lý Skills

#### Test Case 6.2.1: Thêm skill
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Nhập tên skill | Field được điền |
| 2 | Click "Thêm" | Skill xuất hiện trong list |

### 6.3 Quản lý Experience

#### Test Case 6.3.1: Thêm kinh nghiệm
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Thêm kinh nghiệm" | Hiển thị form |
| 2 | Điền thông tin | Các field được điền |
| 3 | Click "Lưu" | Experience xuất hiện trong list |

### 6.4 Quản lý Education

#### Test Case 6.4.1: Thêm học vấn
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Thêm học vấn" | Hiển thị form |
| 2 | Điền thông tin | Các field được điền |
| 3 | Click "Lưu" | Education xuất hiện trong list |

---

## 7. TEST CHAT REAL-TIME

### 7.1 Kết nối SignalR

#### Test Case 7.1.1: Kết nối thành công
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Đăng nhập | Console log: "SignalR connected" |
| 2 | Mở DevTools > Network > WS | Thấy kết nối WebSocket |

### 7.2 Gửi tin nhắn

#### Điều kiện: Cần 2 user đăng nhập (2 tab/browser)

#### Test Case 7.2.1: Gửi và nhận tin nhắn
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | User A truy cập `/chat` | Hiển thị danh sách conversations |
| 2 | User A bắt đầu chat với User B | Mở conversation |
| 3 | User A gửi tin nhắn | Tin nhắn xuất hiện |
| 4 | User B nhận tin nhắn | Tin nhắn hiển thị real-time |
| 5 | User B reply | User A nhận được reply |

### 7.3 Notification tin nhắn

#### Test Case 7.3.1: Thông báo tin nhắn mới
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | User A ở trang khác (không phải chat) | - |
| 2 | User B gửi tin nhắn cho User A | - |
| 3 | User A nhận notification | Toast notification xuất hiện |
| 4 | Badge trên icon tin nhắn | Số unread tăng lên |

### 7.4 Lịch sử tin nhắn

#### Test Case 7.4.1: Load lịch sử
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Mở một conversation | Hiển thị tin nhắn cũ |
| 2 | Scroll lên | Load thêm tin nhắn cũ (nếu có) |

---

## 8. TEST ADMIN FUNCTIONS

### 8.1 Dashboard Admin

#### Điều kiện: Đăng nhập với tài khoản Admin

#### Test Case 8.1.1: Xem dashboard
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/admin/dashboard` | Hiển thị thống kê tổng quan |
| 2 | Xem số liệu | Hiển thị users, companies, jobs, applications |

### 8.2 Quản lý Users

#### Test Case 8.2.1: Xem danh sách users
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click menu "Users" | Hiển thị danh sách users |
| 2 | Tìm kiếm user | Kết quả được lọc |
| 3 | Lọc theo role | Kết quả được lọc |

#### Test Case 8.2.2: Khóa/Mở khóa user
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Khóa" trên một user | User bị deactivate |
| 2 | User đó đăng nhập | Không thể đăng nhập |
| 3 | Admin "Mở khóa" | User có thể đăng nhập lại |

### 8.3 Quản lý Companies

#### Test Case 8.3.1: Duyệt công ty
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Xem danh sách companies pending | Hiển thị các công ty chờ duyệt |
| 2 | Click "Duyệt" | Công ty được approve |
| 3 | Employer đăng nhập | Có thể đăng tin |

#### Test Case 8.3.2: Từ chối công ty
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Click "Từ chối" | Công ty bị reject |
| 2 | Employer nhận thông báo | Biết lý do từ chối |

### 8.4 Xem System Logs

#### Test Case 8.4.1: Xem activity logs
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Truy cập `/admin/logs` | Hiển thị trang logs |
| 2 | Tab "Lịch sử hoạt động" | Hiển thị các hoạt động |
| 3 | Lọc theo User ID | Kết quả được lọc |
| 4 | Lọc theo ngày | Kết quả được lọc |

#### Test Case 8.4.2: Xem error logs
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Tab "Log lỗi" | Hiển thị các lỗi hệ thống |
| 2 | Lọc theo mức độ | Kết quả được lọc |
| 3 | Click "Xem Stack Trace" | Hiển thị chi tiết lỗi |

---

## 9. TEST API VỚI POSTMAN

### 9.1 Import Collection

1. Mở Postman
2. File > Import
3. Chọn file collection (nếu có) hoặc tạo mới

### 9.2 Các API cần test

#### Authentication APIs
```
POST /api/Auth/register
POST /api/Auth/login
POST /api/Auth/refresh-token
POST /api/Auth/logout
```

#### Companies APIs
```
GET  /api/Companies
GET  /api/Companies/{id}
GET  /api/Companies/my-company
POST /api/Companies
PUT  /api/Companies/{id}
PUT  /api/Companies/{id}/status
```

#### JobPosts APIs
```
GET  /api/JobPosts
GET  /api/JobPosts/{id}
GET  /api/JobPosts/company/{companyId}
GET  /api/JobPosts/search
POST /api/JobPosts
PUT  /api/JobPosts/{id}
PUT  /api/JobPosts/{id}/status
DELETE /api/JobPosts/{id}
```

#### Applications APIs
```
GET  /api/Applications/job/{jobId}
GET  /api/Applications/my-applications
POST /api/Applications
PUT  /api/Applications/{id}/status
```

#### Profiles APIs
```
GET  /api/Profiles/{id}
GET  /api/Profiles/my-profile
POST /api/Profiles
PUT  /api/Profiles/{id}
```

#### Chat APIs
```
GET  /api/Chat/conversations
GET  /api/Chat/conversations/{id}/messages
POST /api/Chat/conversations
POST /api/Chat/messages
```

#### Admin APIs
```
GET  /api/Admin/users
GET  /api/Admin/stats
GET  /api/Logs/activities
GET  /api/Logs/errors
```

### 9.3 Test Authorization

| Test | Header | Kết quả mong đợi |
|------|--------|------------------|
| Không có token | - | 401 Unauthorized |
| Token hết hạn | Authorization: Bearer {expired} | 401 Unauthorized |
| Token hợp lệ | Authorization: Bearer {valid} | 200 OK + data |
| Không có quyền | Token của Student gọi Admin API | 403 Forbidden |

---

## 10. CHECKLIST TỔNG HỢP

### ✅ Authentication
- [ ] Đăng ký tài khoản mới
- [ ] Validation form đăng ký
- [ ] Đăng nhập thành công
- [ ] Đăng nhập thất bại
- [ ] Đăng xuất
- [ ] Redirect theo role
- [ ] Token được lưu localStorage
- [ ] Refresh token hoạt động

### ✅ Employer Flow
- [ ] Tạo hồ sơ công ty
- [ ] Cập nhật hồ sơ công ty
- [ ] Đợi Admin duyệt
- [ ] Đăng tin tuyển dụng
- [ ] Sửa tin tuyển dụng
- [ ] Ẩn/Hiện tin
- [ ] Xóa tin
- [ ] Xem danh sách ứng viên
- [ ] Cập nhật trạng thái ứng viên
- [ ] Xem hồ sơ ứng viên
- [ ] Chat với ứng viên

### ✅ Student/Candidate Flow
- [ ] Tìm kiếm việc làm
- [ ] Lọc theo từ khóa, địa điểm
- [ ] Xem chi tiết tin tuyển dụng
- [ ] Ứng tuyển việc làm
- [ ] Xem danh sách đã ứng tuyển
- [ ] Tạo/Cập nhật hồ sơ
- [ ] Thêm skills
- [ ] Thêm kinh nghiệm
- [ ] Thêm học vấn
- [ ] Chat với nhà tuyển dụng

### ✅ Admin Flow
- [ ] Xem dashboard thống kê
- [ ] Quản lý users
- [ ] Khóa/Mở khóa user
- [ ] Duyệt công ty
- [ ] Từ chối công ty
- [ ] Xem activity logs
- [ ] Xem error logs
- [ ] Lọc logs

### ✅ Chat Real-time
- [ ] Kết nối SignalR
- [ ] Gửi tin nhắn
- [ ] Nhận tin nhắn real-time
- [ ] Notification tin nhắn mới
- [ ] Xem lịch sử chat
- [ ] Badge unread messages

### ✅ UI/UX
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Success notifications
- [ ] Confirm dialogs
- [ ] Form validation
- [ ] Pagination

### ✅ Security
- [ ] Routes protected
- [ ] API authentication
- [ ] Role-based access
- [ ] XSS prevention
- [ ] CORS configuration

---

## 📝 GHI CHÚ BUG

| # | Mô tả bug | Bước tái tạo | Mức độ | Trạng thái |
|---|-----------|--------------|--------|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 📞 LIÊN HỆ

Nếu phát hiện bug hoặc có câu hỏi, vui lòng liên hệ:
- **Email:** support@ptj.com
- **GitHub Issues:** [Link to repo]

---

*Tài liệu này được tạo tự động và cập nhật theo phiên bản dự án.*
