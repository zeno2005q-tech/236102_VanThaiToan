import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    foodId: '', name: '', category: '', cuisine: '',
    ingredients: '', price: '', quantity: '', description: '', imageUrl: ''
  });
  const [editingId, setEditingId] = useState(null);

  // 1. Lấy danh sách món ăn (có hỗ trợ tìm kiếm)
  const fetchFoods = async (keyword = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/foods${keyword ? `?search=${keyword}` : ''}`);
      setFoods(res.data);
      setError('');
    } catch (err) {
      setError('Lỗi kết nối đến Backend API!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // 2. Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchFoods(search);
  };

  // 3. Xử lý nhập liệu form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Gửi form (Thêm mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Xử lý kiểu dữ liệu trước khi gửi
    const payload = {
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      ingredients: typeof formData.ingredients === 'string' 
        ? formData.ingredients.split(',').map(i => i.trim()) 
        : formData.ingredients
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/foods/${editingId}`, payload);
        alert('Cập nhật món ăn thành công!');
      } else {
        await axios.post(`${API_URL}/foods`, payload);
        alert('Thêm món ăn mới thành công!');
      }
      resetForm();
      fetchFoods(); // Tải lại danh sách
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu món ăn!');
    }
  };

  // 5. Đưa dữ liệu lên form để sửa
  const handleEdit = (food) => {
    setEditingId(food._id);
    setFormData({
      foodId: food.foodId,
      name: food.name,
      category: food.category,
      cuisine: food.cuisine,
      ingredients: food.ingredients.join(', '),
      price: food.price,
      quantity: food.quantity,
      description: food.description || '',
      imageUrl: food.imageUrl || ''
    });
  };

  // 6. Xóa món ăn
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      try {
        await axios.delete(`${API_URL}/foods/${id}`);
        alert('Đã xóa thành công!');
        fetchFoods();
      } catch (err) {
        alert('Lỗi khi xóa món ăn!');
      }
    }
  };

  // Làm sạch form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      foodId: '', name: '', category: '', cuisine: '',
      ingredients: '', price: '', quantity: '', description: '', imageUrl: ''
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>
        QUẢN LÝ MÓN ĂN - MSSV: 236102 - Văn Thái Toàn
      </h2>

      {/* Thanh tìm kiếm */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Tìm theo tên, loại món, vùng miền..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ padding: '10px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Tìm kiếm</button>
        <button type="button" onClick={() => { setSearch(''); fetchFoods(''); }} style={{ padding: '10px 20px', cursor: 'pointer' }}>Xóa bộ lọc</button>
      </form>

      {/* Form Thêm/Cập nhật */}
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
        <h3>{editingId ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input name="foodId" placeholder="Mã món ăn (VD: F04)*" value={formData.foodId} onChange={handleInputChange} disabled={!!editingId} required />
          <input name="name" placeholder="Tên món ăn*" value={formData.name} onChange={handleInputChange} required />
          <input name="category" placeholder="Loại món ăn*" value={formData.category} onChange={handleInputChange} required />
          <input name="cuisine" placeholder="Vùng miền (Ẩm thực)*" value={formData.cuisine} onChange={handleInputChange} required />
          <input name="price" type="number" placeholder="Giá bán (VNĐ)*" value={formData.price} onChange={handleInputChange} required />
          <input name="quantity" type="number" placeholder="Số lượng*" value={formData.quantity} onChange={handleInputChange} required />
          <input name="ingredients" placeholder="Nguyên liệu (phân cách bằng dấu phẩy)" value={formData.ingredients} onChange={handleInputChange} style={{ gridColumn: 'span 2' }} />
          <input name="imageUrl" placeholder="Đường dẫn hình ảnh (URL)" value={formData.imageUrl} onChange={handleInputChange} style={{ gridColumn: 'span 2' }} />
          <textarea name="description" placeholder="Mô tả món ăn" value={formData.description} onChange={handleInputChange} style={{ gridColumn: 'span 2', minHeight: '60px' }} />
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
              {editingId ? 'Lưu cập nhật' : 'Thêm mới'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Thông báo trạng thái */}
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Bảng danh sách món ăn */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#f1f1f1' }}>
          <tr>
            <th>Mã món</th>
            <th>Tên món ăn</th>
            <th>Loại</th>
            <th>Vùng miền</th>
            <th>Giá (VNĐ)</th>
            <th>SL</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {foods.length > 0 ? foods.map(item => (
            <tr key={item._id}>
              <td>{item.foodId}</td>
              <td style={{ fontWeight: 'bold' }}>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.cuisine}</td>
              <td>{item.price.toLocaleString()}</td>
              <td>{item.quantity}</td>
              <td>
                <button onClick={() => handleEdit(item)} style={{ marginRight: '5px', cursor: 'pointer' }}>Sửa</button>
                <button onClick={() => handleDelete(item._id)} style={{ color: 'red', cursor: 'pointer' }}>Xóa</button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;