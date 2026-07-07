import mongoose from 'mongoose';

// DCCounter Schema for auto-incrementing invoice IDs
const dcCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

const DCCounter = mongoose.model('DCCounter', dcCounterSchema, 'counters');

const dcInvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  shipperName: { type: String, required: true },
  userName:  { type: String },
  createdBy:  { type: String, default: '' },
  totalAmount: { type: Number, required: true },
  totalDeliveryCharge: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  remainingAmount: { type: Number, default: function() { return this.netAmount; } },
  paidAmount: { type: Number, default: 0 },
 paidFrom: [{
  from: { type: String },
  amount: { type: Number },
  date: { type: Date, default: Date.now },
  sendingFrom: { type: String, default: null },
  receivingIn: { type: String, default: null },
  receiverAccountHolderName: { type: String, default: null },
receiverIbanNumber: { type: String, default: null },
receiverAccountNumber: { type: String, default: null },
}],
  paidBy: { type: String, default: null },
  isFullyPaid: { type: Boolean, default: false },
  paidByShipperBallnce: { type: Boolean, default: false },
   // ✅ ADD THIS NEW FIELD HERE:
  paidByInvoice: [{
    invoiceId: { type: String },
    amount: { type: Number },
    paidAt: { type: Date, default: Date.now }
  }],
  isPriority: { type: Boolean,  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'leopardsOrdersmodal' }],
  codInvoiceOrdersID: [{ type: String }], // Added to store CodInvoice IDs
  govTax: { type: Number, default: 0 }, // Added field for government tax
  otherCharges: { type: Number, default: 0 }, // Added field for other charges
  excelDownload: { type: Boolean, default: false }, // New field to track if invoice is downloaded as Excel
    bankAutoVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Unique indexes handled automatically
dcInvoiceSchema.index({ "shipperInfo.userName": 1 });
dcInvoiceSchema.index({ "shipperInfo.shipperName": 1 });
dcInvoiceSchema.index({ createdAt: -1 });
dcInvoiceSchema.index({ createdAt: -1, orders: 1 }); // compound better
dcInvoiceSchema.index({ govTax: 1 });
dcInvoiceSchema.index({ paidBalance: 1 });
dcInvoiceSchema.index({ unpaidBalance: 1 });
dcInvoiceSchema.index({ codAmount: 1 });
dcInvoiceSchema.index({ totalDeliveryCharge: 1 });
dcInvoiceSchema.index({ status: 1 });
dcInvoiceSchema.index({ payableStatus: 1 });
dcInvoiceSchema.index({ deliveryDate: 1 });
dcInvoiceSchema.index({ orders: 1 });
dcInvoiceSchema.index({ codInvoiceOrdersID: 1 });

// Compound indexes (optional, for frequent queries)
dcInvoiceSchema.index({ userName: 1, status: 1 });
dcInvoiceSchema.index({ userName: 1, payableStatus: 1 });
dcInvoiceSchema.index({ userName: 1, codAmount: 1 });

export default mongoose.model('DCInvoice', dcInvoiceSchema, 'DCInvoice');
export { DCCounter };