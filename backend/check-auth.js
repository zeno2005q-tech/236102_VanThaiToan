require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

console.log("--- KIỂM TRA THÔNG TIN KẾT NỐI ---");
console.log("1. Đã đọc được file .env:", process.env.PORT ? "Có" : "Không");
console.log("2. Biến MONGO_URI:", uri ? "Đã tồn tại (Độ dài: " + uri.length + ")" : "BỊ UNDEFINED HOẶC TRỐNG");

if (uri) {
  // Ẩn mật khẩu khi in ra để bảo mật
  const maskedUri = uri.replace(/:([^:@]+)@/, ":****@");
  console.log("3. Chuỗi kết nối đang dùng:", maskedUri);
}

async function testConnection() {
  if (!uri) return;
  try {
    console.log("4. Đang thử kết nối trực tiếp tới MongoDB Atlas...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(">>> THÀNH CÔNG: Kết nối MongoDB thành công mỹ mãn!");
    process.exit(0);
  } catch (error) {
    console.error(">>> THẤT BẠI: Lỗi chi tiết từ MongoDB Driver:");
    console.error("- Mã lỗi (Code):", error.code);
    console.error("- Tên lỗi:", error.name);
    console.error("- Thông báo:", error.message);
    process.exit(1);
  }
}

testConnection();