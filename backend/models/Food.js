const mongoose = require('mongoose');
const foodSchema = new mongoose.Schema({
  foodId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  cuisine: { type: String, required: true },
  ingredients: [{ type: String }],
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Food', foodSchema);