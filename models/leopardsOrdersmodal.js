// leopardsOrdersmodal.js
import mongoose from 'mongoose';

const packetSchema = new mongoose.Schema({
  companyId: { type: String, unique: true, required: true },
   acc: { type: String,}, 
  companyName: { type: String },
  destinationCityId: { type: String },
  destinationCityName: { type: String, required: true },
  consigneePhone: { type: String, required: true },
  whatsappNumber: { type: String },
  consigneePhone2: { type: String, default: '' },
  consigneeName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  consigneeAddress: { type: String, required: true },
  netWeight: { type: Number,  min: 0 },
  apiNetWeight: { type: Number,  min: 0 },
  codAmount: { type: Number, },
  deliveryCharge: { type: Number, required: true, min: 0 },
  deliveryChargeCeo: { type: Number, min: 0 },
  ceoDeliveryChargeRecord: { type: Number, min: 0 },
  referenceNumber: { type: String, default: '' },
  origin_city: { type: String, default: '' },
  userReferenceNumber: { type: String, default: '' },
  collectionAmount: { type: Number, default: 0 },
  specialInstructions: { type: String, default: '' },
  shipmentType: { type: String, default: 'overnight' },
  source: {
      type: String,
      default: "",
    },
  // Add new fields inside schema
  riderDate: { type: Date, default: null },
  deliveredDate: { type: Date, default: null },
  shipperInfo: {
    pickupAddress: { type: String, required: true },
    shipperPhone: { type: String, required: true },
    shipperName: { type: String, required: true },
    shipperEmail: { type: String, default: '' },
    shipmentId: { type: String, required: true },
    userName: { type: String, required: true },
  },
  trackNumber: { type: String, default: '' },
  slipLink: { type: String, default: '' },
  isInvoiced: { type: Boolean, default: false },
  isCodoInvoiced: { type: Boolean, default: false },
 
  apiStatus: { type: String, default: "Booked" },
  bcStatus: { type: String, default: "Booked" },
  orderId: { type: String},
  productName: { type: String},
  chargesFromCheques :{ type: Number, min: 0 },
  finovaCharges : { type: Number, min: 0 },
  sentToOrderSheet: { type: Boolean, default: false },
  lastBcStatusChange: { type: Date },
  notificationsSent: [{ type: String, default: [] }], // New field to track sent templates
  shipperNotificationsSent: [{ type: String }],
  apiWeightCharged: { type: Number, min: 0 },
  apiGstPercentage: { type: Number, min: 0 },
  apiCashHandlingCharges: { type: Number, min: 0 },
  apiShipmentCharges: { type: Number, min: 0 },
  apiGstAmount: { type: Number, min: 0 },
  apiFuelSurchargePercentage: { type: Number, min: 0 },
  apiFuelSurchargeAmount: { type: Number, min: 0 },
  apiNetCharges: { type: Number, min: 0 },
  apiGrossCharges: { type: Number, min: 0 },
  apiReturnCharges: { type: Number, min: 0 },
  apiChargesLastUpdated: { type: Date },
  // New field for tracking last processed status
  lastProcessedStatus: { type: String },
  apiDeliveredChargesUpdated: { type: Date },
  isLoadSheet:{type: Boolean, default: false},
  orderType:{type:String, default:""},
  lastTwoStatuses: [{
  status: { type: String },
  reason: { type: String },
  date: { type: Date }
}]
}, {
  timestamps: true,
  versionKey: false
});







// 🔹 Optimized Compound Indexes
packetSchema.index({ "shipperInfo.userName": 1, isInvoiced: 1 });
packetSchema.index({ "shipperInfo.userName": 1, isCodoInvoiced: 1 });
packetSchema.index({ "shipperInfo.userName": 1, bcStatus: 1 });
packetSchema.index({ "shipperInfo.userName": 1, trackNumber: 1 });
packetSchema.index({ trackNumber: 1, companyName: 1, bcStatus: 1 });


   packetSchema.index({ trackNumber: 1 })
  
   packetSchema.index({ companyName: 1 })
   

// Indexes
packetSchema.index({ "shipperInfo.userName": 1 });
packetSchema.index({ isCodoInvoiced: 1 });
packetSchema.index({ isInvoiced: 1 });
packetSchema.index({ trackNumber: 1 });
packetSchema.index({ bcStatus: 1 });
packetSchema.index({ _id: 1, deliveryCharge: 1 });




export default mongoose.model('leopardsOrdersmodal', packetSchema, 'leopardsOrdersmodal');

