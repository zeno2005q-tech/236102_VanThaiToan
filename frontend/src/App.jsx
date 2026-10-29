
import { useEffect, useState } from "react";
import {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
} from "./services/api";
import "./App.css";

const emptyFood = {
  foodId: "",
  name: "",
  category: "",
  cuisine: "",
  ingredients: "",
  price: "",
  quantity: "",
  description: "",
  imageUrl: "",
};

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyFood);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Tải danh sách món ăn
  async function loadFoods(keyword = "") {
    setLoading(true);

    try {
      const result = await getFoods(keyword);

      // Hỗ trợ API trả về mảng hoặc object chứa data
      const foodList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setFoods(foodList);
      setMessage("");
    } catch (error) {
      console.error("Lỗi tải danh sách món ăn:", error);
      setFoods([]);
      setMessage(
        error.response?.data?.message ||
          "Không tải được danh sách món ăn. Hãy kiểm tra kết nối Backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, []);

  // Xử lý thay đổi các ô nhập liệu
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Xóa dữ liệu biểu mẫu
  function resetForm() {
    setForm({ ...emptyFood });
    setEditingId(null);
  }

  // Thêm hoặc cập nhật món ăn
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const food = {
      ...form,
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      if (editingId) {
        await updateFood(editingId, food);
        setMessage("Cập nhật món ăn thành công!");
      } else {
        await createFood(food);
        setMessage("Thêm món ăn thành công!");
      }

      resetForm();
      await loadFoods(search);
    } catch (error) {
      console.error("Lỗi lưu món ăn:", error);
      setMessage(
        error.response?.data?.message ||
          "Thao tác thất bại. Vui lòng kiểm tra dữ liệu nhập."
      );
    }
  }

  // Chọn món ăn để sửa
  function handleEdit(food) {
    setEditingId(food.id || food._id);

    setForm({
      foodId: food.foodId || "",
      name: food.name || "",
      category: food.category || "",
      cuisine: food.cuisine || "",
      ingredients: Array.isArray(food.ingredients)
        ? food.ingredients.join(", ")
        : "",
      price: food.price ?? "",
      quantity: food.quantity ?? "",
      description: food.description || "",
      imageUrl: food.imageUrl || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Xóa món ăn
  async function handleDelete(food) {
    const id = food.id || food._id;

    if (!window.confirm(`Bạn có chắc muốn xóa "${food.name}"?`)) {
      return;
    }

    try {
      await deleteFood(id);
      setMessage("Xóa món ăn thành công!");
      await loadFoods(search);
    } catch (error) {
      console.error("Lỗi xóa món ăn:", error);
      setMessage(
        error.response?.data?.message || "Không thể xóa món ăn."
      );
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">FOOD MANAGEMENT SYSTEM</p>
        <h1>Quản lý món ăn</h1>
        <p>Quản lý thực đơn của bạn trong một giao diện duy nhất.</p>
      </header>

      {message && (
        <div className="message" role="status">
          {message}
        </div>
      )}

      <section className="panel">
        <h2>{editingId ? "Cập nhật món ăn" : "Thêm món ăn mới"}</h2>

        <form onSubmit={handleSubmit} className="food-form">
          <label>
            Mã món ăn
            <input
              name="foodId"
              value={form.foodId}
              onChange={handleChange}
              placeholder="Ví dụ: FOOD004"
              required
              disabled={Boolean(editingId)}
            />
          </label>

          <label>
            Tên món ăn
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập tên món ăn"
              required
            />
          </label>

          <label>
            Danh mục
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Ví dụ: Món nước"
              required
            />
          </label>

          <label>
            Ẩm thực
            <input
              name="cuisine"
              value={form.cuisine}
              onChange={handleChange}
              placeholder="Ví dụ: Việt Nam"
              required
            />
          </label>

          <label>
            Nguyên liệu
            <input
              name="ingredients"
              value={form.ingredients}
              onChange={handleChange}
              placeholder="Gạo, thịt, rau"
            />
            <small>Phân cách nguyên liệu bằng dấu phẩy.</small>
          </label>

          <label>
            Giá (VNĐ)
            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="50000"
              required
            />
          </label>

          <label>
            Số lượng
            <input
              type="number"
              min="0"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="10"
              required
            />
          </label>

          <label>
            URL hình ảnh
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <label className="wide">
            Mô tả
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả món ăn..."
              rows="3"
            />
          </label>

          <div className="wide actions">
            <button type="submit">
              {editingId ? "Lưu thay đổi" : "Thêm món ăn"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={resetForm}
              >
                Hủy sửa
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="list-header">
          <div>
            <h2>Danh sách món ăn</h2>
            <p>Tổng số: {foods.length} món ăn</p>
          </div>

          <form
            className="search"
            onSubmit={(event) => {
              event.preventDefault();
              loadFoods(search);
            }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên món ăn..."
              aria-label="Tìm món ăn"
            />
            <button type="submit">Tìm kiếm</button>
          </form>
        </div>

        {loading ? (
          <p className="empty-state">Đang tải dữ liệu...</p>
        ) : foods.length === 0 ? (
          <p className="empty-state">Chưa có món ăn phù hợp.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã món</th>
                  <th>Tên món</th>
                  <th>Danh mục</th>
                  <th>Ẩm thực</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {foods.map((food) => (
                  <tr key={food.id || food._id}>
                    <td>{food.foodId}</td>

                    <td>
                      <strong>{food.name}</strong>
                      {food.description && (
                        <small className="description">
                          {food.description}
                        </small>
                      )}
                    </td>

                    <td>{food.category}</td>
                    <td>{food.cuisine}</td>

                    <td className="price">
                      {Number(food.price).toLocaleString("vi-VN")} ₫
                    </td>

                    <td>{food.quantity}</td>

                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => handleEdit(food)}
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(food)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="footer">
        Food Management · React · Node.js · MongoDB
      </footer>
    </main>
  );
}

export default App;
