import mongoose from "mongoose";

const orderAddressSchema = new mongoose.Schema(
  {
    address1: String,
    address2: String,
    city: String,
    province: String,
    zip: String,
    country: String,
    countryCode: String,
    provinceCode: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
    dashboardUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DashboardUser",
      default: null,
      index: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    shopDomain: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      index: true,
    },
    shopifyOrderId: {
      type: Number,
      required: true,
    },
    adminGraphqlApiId: String,
    orderName: String,
    orderNumber: Number,
    customerName: String,
    email: String,
    phone: String,
    address: orderAddressSchema,
    financialStatus: String,
    fulfillmentStatus: String,
    itemCount: Number,
    totalPrice: String,
    currency: String,
    createdAt: Date,
    updatedAt: Date,
    syncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: "Orders",
  }
);

orderSchema.index(
  { shopDomain: 1, shopifyOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      shopDomain: { $type: "string" },
      shopifyOrderId: { $type: "number" },
    },
  }
);
orderSchema.index(
  { storeId: 1, shopifyOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      storeId: { $type: "objectId" },
      shopifyOrderId: { $type: "number" },
    },
  }
);
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ dashboardUserId: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
