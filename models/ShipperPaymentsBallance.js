import mongoose from "mongoose";

// Withdrawal request schema
const ShipperBallanceSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId },
  shipperName: { type: String },
  accountHolderName: { type: String },
  phoneNumber: { type: String },
  amount: { type: Number },
  workAmount: { type: Number,},
  paymentMethod: { type: String, },
  status: { type: String, enum: ["Pending", "Success", "Rejected"], default: "Pending" },
  imagePath: { type: String },
  createdAt: { type: Date, default: Date.now },
  acceptedBy: { type: String, default: "Admin" },
  acceptedByFullName: {
  type: String,
  trim: true,
}
});

// 🔹 Single-field indexes
ShipperBallanceSchema.index({ sellerId: 1 });
ShipperBallanceSchema.index({ shipperName: 1 });
ShipperBallanceSchema.index({ accountHolderName: 1 });
ShipperBallanceSchema.index({ phoneNumber: 1 });
ShipperBallanceSchema.index({ status: 1 });
ShipperBallanceSchema.index({ paymentMethod: 1 });
ShipperBallanceSchema.index({ createdAt: 1 });

// 🔹 Compound indexes (optional, for frequent multi-field queries)
ShipperBallanceSchema.index({ sellerId: 1, status: 1 });
ShipperBallanceSchema.index({ shipperName: 1, status: 1 });
ShipperBallanceSchema.index({ sellerId: 1, paymentMethod: 1 });
ShipperBallanceSchema.index({ status: 1, createdAt: 1 });

const ShipperBallance = mongoose.model("ShipperBallance", ShipperBallanceSchema);

export default ShipperBallance;