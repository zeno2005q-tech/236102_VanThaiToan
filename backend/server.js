
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Schema món ăn
const foodSchema = new mongoose.Schema({
  foodId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  cuisine: {
    type: String,
    required: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ""
  },
  imageUrl: {
    type: String,
    default: ""
  }
});

const Food = mongoose.model("Food", foodSchema, "foods");

// Kiểm tra trạng thái backend
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// GET: Lấy danh sách và tìm kiếm món ăn
app.get("/api/foods", async (req, res, next) => {
  try {
    const search = (req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { cuisine: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const foods = await Food.find(filter);

    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    next(error);
  }
});

// GET: Xem chi tiết một món ăn
app.get("/api/foods/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn"
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    next(error);
  }
});

// POST: Thêm món ăn
app.post("/api/foods", async (req, res, next) => {
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
      imageUrl
    } = req.body;

    if (
      typeof foodId !== "string" || !foodId.trim() ||
      typeof name !== "string" || !name.trim() ||
      typeof category !== "string" || !category.trim() ||
      typeof cuisine !== "string" || !cuisine.trim() ||
      !Array.isArray(ingredients) ||
      !ingredients.every(item => typeof item === "string") ||
      typeof price !== "number" || !Number.isFinite(price) || price < 0 ||
      typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu món ăn không hợp lệ"
      });
    }

    const food = await Food.create({
      foodId: foodId.trim(),
      name: name.trim(),
      category: category.trim(),
      cuisine: cuisine.trim(),
      ingredients,
      price,
      quantity,
      description,
      imageUrl
    });

    res.status(201).json({
      success: true,
      data: food
    });
  } catch (error) {
    next(error);
  }
});

// PUT: Cập nhật món ăn
app.put("/api/foods/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }

    const allowedFields = [
      "foodId",
      "name",
      "category",
      "cuisine",
      "ingredients",
      "price",
      "quantity",
      "description",
      "imageUrl"
    ];

    const update = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu cập nhật"
      });
    }

    if (
      update.foodId !== undefined &&
      (typeof update.foodId !== "string" || !update.foodId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "foodId không hợp lệ"
      });
    }

    if (
      update.name !== undefined &&
      (typeof update.name !== "string" || !update.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Tên món ăn không hợp lệ"
      });
    }

    if (
      update.ingredients !== undefined &&
      (!Array.isArray(update.ingredients) ||
       !update.ingredients.every(item => typeof item === "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Nguyên liệu không hợp lệ"
      });
    }

    for (const field of ["category", "cuisine"]) {
      if (
        update[field] !== undefined &&
        (typeof update[field] !== "string" || !update[field].trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} không hợp lệ`
        });
      }
    }

    for (const field of ["price", "quantity"]) {
      if (
        update[field] !== undefined &&
        (
          typeof update[field] !== "number" ||
          !Number.isFinite(update[field]) ||
          update[field] < 0 ||
          (field === "quantity" && !Number.isInteger(update[field]))
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} không hợp lệ`
        });
      }
    }

    if (update.foodId !== undefined) {
      update.foodId = update.foodId.trim();
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn"
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Xóa món ăn
app.delete("/api/foods/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }

    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn"
      });
    }

    res.json({
      success: true,
      message: "Đã xóa món ăn"
    });
  } catch (error) {
    next(error);
  }
});

// Xử lý lỗi chung
app.use((error, req, res, next) => {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Mã món ăn foodId đã tồn tại"
    });
  }

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ"
    });
  }

  res.status(500).json({
    success: false,
    message: "Lỗi máy chủ hoặc cơ sở dữ liệu"
  });
});

// Kết nối MongoDB rồi khởi động server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
