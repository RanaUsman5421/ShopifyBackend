import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
    },
    shopDomain: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      index: true,
    },
    dashboardUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DashboardUser",
      default: null,
      index: true,
    },
    settings: {
      defaultCourier: {
        type: String,
        enum: ["M&P", "Leopards", "TCS", "BarqRaftaar", "Trax"],
        default: "M&P",
      },
      defaultWeight: {
        type: String,
        default: "0.5",
        trim: true,
      },
      orderBooking: {
        type: String,
        enum: ["Auto", "Manual"],
        default: "Manual",
      },
    },
    orders: [
      {
        shopifyOrderId: Number,
        adminGraphqlApiId: String,
        orderName: String,
        orderNumber: Number,
        customerName: String,
        email: String,
        phone: String,
        address: {
          address1: String,
          address2: String,
          city: String,
          province: String,
          zip: String,
          country: String,
          countryCode: String,
          provinceCode: String,
        },
        financialStatus: String,
        fulfillmentStatus: String,
        itemCount: Number,
        totalPrice: String,
        currency: String,
        createdAt: String,
        updatedAt: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: "stores",
  }
);

export default mongoose.model("Store", storeSchema);
