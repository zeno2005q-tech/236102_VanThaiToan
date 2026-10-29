const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const Food = require("./models/Food");

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
      : true,
  })
);

app.use(express.json());

// Chuẩn hóa tiếng Việt để tìm kiếm không phân biệt dấu
function normalizeVietnamese(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// ==================== HEALTH CHECK ====================

// Kiểm tra trạng thái backend và MongoDB
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Food Management API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// ==================== GET ALL / SEARCH FOODS ====================

app.get("/api/foods", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    let foods;

    if (search) {
      const keyword = normalizeVietnamese(search);

      const allFoods = await Food.find().sort({ createdAt: -1 });

      foods = allFoods.filter((food) => {
        const fields = [
          food.name,
          food.category,
          food.cuisine,
        ];

        return fields.some((value) => {
          if (typeof value !== "string") {
            return false;
          }

          return normalizeVietnamese(value).includes(keyword);
        });
      });
    } else {
      foods = await Food.find().sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách món ăn:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách món ăn",
    });
  }
});

// ==================== GET FOOD BY ID ====================

app.get("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    return res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "ID món ăn không hợp lệ",
    });
  }
});

// ==================== CREATE FOOD ====================

app.post("/api/foods", async (req, res) => {
  try {
    const {
      foodId,
      name,
      category,
      cuisine,
      ingredients,
      price,
      quantity,
      description,
      imageUrl,
    } = req.body;

    if (
      typeof foodId !== "string" ||
      !foodId.trim() ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof cuisine !== "string" ||
      !cuisine.trim() ||
      price === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập mã, tên, loại, ẩm thực, giá và số lượng hợp lệ",
      });
    }

    const normalizedFoodId = foodId.trim();

    const duplicated = await Food.findOne({
      foodId: normalizedFoodId,
    });

    if (duplicated) {
      return res.status(409).json({
        success: false,
        message: "Mã món ăn đã tồn tại",
      });
    }

    const food = await Food.create({
      foodId: normalizedFoodId,
      name: name.trim(),
      category: category.trim(),
      cuisine: cuisine.trim(),
      ingredients,
      price,
      quantity,
      description,
      imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm món ăn thành công",
      data: food,
    });
  } catch (error) {
    console.error("Lỗi thêm món ăn:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã món ăn đã tồn tại",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu món ăn không hợp lệ",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi khi thêm món ăn",
    });
  }
});

// ==================== UPDATE FOOD ====================

app.put("/api/foods/:id", async (req, res) => {
  try {
    const allowedFields = [
      "foodId",
      "name",
      "category",
      "cuisine",
      "ingredients",
      "price",
      "quantity",
      "description",
      "imageUrl",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu để cập nhật",
      });
    }

    if (updates.foodId !== undefined) {
      if (
        typeof updates.foodId !== "string" ||
        !updates.foodId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Mã món ăn không hợp lệ",
        });
      }

      updates.foodId = updates.foodId.trim();

      const duplicated = await Food.findOne({
        foodId: updates.foodId,
        _id: { $ne: req.params.id },
      });

      if (duplicated) {
        return res.status(409).json({
          success: false,
          message: "Mã món ăn đã tồn tại",
        });
      }
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật món ăn thành công",
      data: food,
    });
  } catch (error) {
    console.error("Lỗi cập nhật món ăn:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã món ăn đã tồn tại",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu cập nhật không hợp lệ",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật món ăn",
    });
  }
});

// ==================== DELETE FOOD ====================

app.delete("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa món ăn thành công",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "ID món ăn không hợp lệ",
    });
  }
});

// ==================== SERVE FRONTEND BUILD ====================

// Phục vụ các file tĩnh trong thư mục build của React Frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Trả về index.html cho các đường dẫn giao diện (Sử dụng cú pháp /*splat chuẩn Express)
app.get("/*splat", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ==================== 404 API HANDLER ====================

// Xử lý các yêu cầu API không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại",
  });
});

// ==================== START SERVER ====================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chưa cấu hình biến môi trường MONGODB_URI");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Cannot start backend:", error.message);
    process.exit(1);
  }
}

startServer();