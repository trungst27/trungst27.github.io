# Kết nối thư viện nhạc với Supabase

Frontend hiện đã phát được MP3 có sẵn và các link SoundCloud. Supabase sẽ lưu file tải lên, bản nháp và danh sách nhạc được xuất bản. Hiện chưa tạo hoặc kết nối project; các bước upload, đăng nhập và xuất bản thực tế cần được kiểm tra sau khi cấu hình.

## 1. Tạo project

1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard), chọn tạo project mới.
2. Chọn gói và khu vực phù hợp. Lưu mật khẩu database ở nơi riêng của bạn.
3. Chờ project khởi tạo xong.

## 2. Tạo bảng dữ liệu và kho lưu trữ

Mở **SQL Editor**, dán toàn bộ nội dung [`supabase/schema.sql`](../supabase/schema.sql) và chạy một lần. Script sẽ tạo:

- `music_tracks`: thông tin bài, mood, thứ tự và trạng thái nháp/xuất bản.
- `music_admins`: ID tài khoản được phép quản lý thư viện.
- Bucket riêng tư `music-audio`, giới hạn 50 MB mỗi file nhạc.
- Bucket công khai `music-covers`, giới hạn 5 MB mỗi ảnh bìa.
- Chính sách truy cập dữ liệu và file cho người nghe và Admin.

Bốn bài ban đầu được thêm sẵn với ID cố định. Hai MP3 vẫn dùng đường dẫn trong website, vì vậy giữ nguyên những file đó. Hai link SoundCloud vẫn phát từ SoundCloud.

## 3. Tạo tài khoản Admin

1. Mở **Authentication → Users → Add user**, tạo tài khoản bằng email Admin bạn đã gửi và mật khẩu tự chọn. Xác nhận email bằng tùy chọn trong Dashboard hoặc email xác nhận.
2. Nếu không cần cho khách đăng ký, tắt đăng ký công khai trong phần cài đặt Authentication.
3. Chạy riêng câu SQL dưới đây, thay `YOUR_ADMIN_EMAIL` bằng email Admin của bạn:

```sql
insert into public.music_admins (user_id)
select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
on conflict do nothing;
```

Quyền quản lý được kiểm tra bằng ID người dùng trong `music_admins` tại database và storage. Việc chỉ đăng nhập đúng email trên giao diện không tự cấp quyền Admin.

## 4. Điền cấu hình công khai

Tìm **Project URL** và **publishable key** trong phần kết nối/API của project. Điền vào [`assets/js/config.js`](../assets/js/config.js):

```js
window.TEUNG_CONFIG = Object.freeze({
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabasePublishableKey: 'sb_publishable_...'
});
```

Hai giá trị này là cấu hình công khai cho trình duyệt. Không điền khóa `sb_secret_...`, service-role key, mật khẩu database hoặc personal access token. Project cũ có thể dùng khóa **anon** với cùng chính sách truy cập.

## 5. Dùng Library Manager

Mở `/admin.html`, đăng nhập tài khoản Admin rồi:

1. Chọn **Upload an audio file** hoặc **SoundCloud track or playlist**.
2. Điền tên bài; nghệ sĩ, mood và ảnh bìa có thể để trống.
3. Bấm **Preview** để nghe thử.
4. **Save draft** lưu bài mới ở chế độ nháp; **Publish** đưa bài vào thư viện công khai.
5. Mở bài có sẵn để sửa. **Save changes** giữ trạng thái công khai hiện tại. **Hide** ẩn bài khỏi thư viện nhưng giữ file trong kho.
6. Dùng mũi tên để đổi thứ tự. Tải lại trang nghe nhạc để thấy cập nhật.

Upload có hiển thị tiến độ. Nếu kết nối bị ngắt, cần tải lại từ đầu; phiên bản này chưa hỗ trợ tiếp tục upload dở. Thay file của một bài không tự xóa file cũ, nên việc dọn kho cần được xem xét riêng.

Nhạc riêng tư được phát qua URL có thời hạn. Khi ẩn bài, người nghe không lấy được URL mới; URL đã cấp có thể vẫn dùng được đến khi hết hạn, tối đa một giờ.

## Cách phát nhạc

- Lần đầu âm lượng là 50%, sau đó ghi nhớ theo từng trình duyệt.
- Bài yêu thích và bài chọn gần nhất lưu trong trình duyệt, không cần tài khoản người nghe.
- SoundCloud dùng trình phát nhúng chính thức; thanh điều khiển chung đồng bộ theo trạng thái của trình phát đó.
- Bài SoundCloud có thể bị hạn chế nhúng và trình duyệt có thể chặn tự phát. Giao diện có nút thử lại và link mở bài gốc khi phát thất bại.
- Khi chưa cấu hình cloud, trang dùng `assets/data/tracks.json`. Nếu cloud đã cấu hình nhưng tạm lỗi, trang chuyển về bộ nhạc có sẵn và hiện thông báo. Admin không giả lập việc lưu thành công.

## Tài liệu chính thức

- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Private file delivery](https://supabase.com/docs/guides/storage/serving/downloads)
- [Password authentication](https://supabase.com/docs/guides/auth/passwords)
- [SoundCloud Widget API](https://developers.soundcloud.com/docs/api/html5-widget)
