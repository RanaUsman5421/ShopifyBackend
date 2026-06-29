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
  },
  {
    timestamps: true,
    collection: "stores",
  }
);

export default mongoose.model("Store", storeSchema);
