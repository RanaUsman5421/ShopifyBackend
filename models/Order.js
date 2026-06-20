const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address1: String,
  address2: String,
  city: String,
  province: String,
  zip: String,
  country: String,
  countryCode: String,
  provinceCode: String
});

const orderItemSchema = new mongoose.Schema({
  shopifyOrderId: Number,
  adminGraphqlApiId: String,
  orderName: String,
  orderNumber: Number,
  customerName: String,
  email: String,
  phone: String,
  address: addressSchema,
  financialStatus: String,
  fulfillmentStatus: String,
  totalPrice: String,
  currency: String,
  createdAt: Date,
  updatedAt: Date
});

const storeOrderSchema = new mongoose.Schema({
  storeName: String,
  orders: [orderItemSchema]
}, { collection: 'orders' });

module.exports = mongoose.model('Order', storeOrderSchema);
