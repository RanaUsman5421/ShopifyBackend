import mongoose from 'mongoose';

// DCCounter Schema for auto-incrementing invoice IDs
const codCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

const CodCounter = mongoose.model('CodCounter', codCounterSchema, 'counters');

// Function to get next sequence value
async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await CodCounter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.sequence_value;
}

const codInvoiceSchema = new mongoose.Schema(
  {
    codInvoiceId: { type: String, unique: true },
    companyName: { type: String },
    trackNumber: { type: String, required: true, unique: true },
    codAmount: { type: Number, required: true, min: 0 }, // Changed from totalAmount
    userName: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    govTax: { type: Number, default: 0, min: 0 }, // New field for 4% tax
    otherCharges: { type: Number, default: 0, min: 0 }, // New field for 4% tax
    orderStatus: { type: String }, // New field to store order's bcStatus
    chequeDate: { type: Date },
    status: {
      type: String,
      default: 'UnPaid',
    //   enum: ['UnPaid', 'Paid', 'PartiallyPaid'],
    },
    payableStatus: { type: Boolean, default: false },
    totalDeliveryCharge: { type: Number, required: true, min: 0 },
    paidBalance: { type: Number, default: 0, min: 0 },
    unpaidBalance: { type: Number, default: 0, min: 0 },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'leopardsOrdersmodal', default: [] }],

// ── Enriched/Denormalized fields (backfill se populate honge) ──
exCollectionAmount:        { type: Number,  default: 0 },
paidByCourier:             { type: Boolean, default: false },
filePayStatus:             { type: Boolean, default: false },
filePayAccNumber:          { type: String,  default: '' },
invReportCollectionAmount: { type: Number,  default: 0 },
cachedDeliveryCharge:      { type: Number,  default: 0 },
effectiveStatus:           { type: String,  default: '' },
lastEnriched:              { type: Date,    default: null },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate codInvoiceId and calculate unpaidBalance
codInvoiceSchema.pre('save', async function (next) {
  if (this.isNew) {
    const seq = await getNextSequenceValue('codInvoiceId');
    this.codInvoiceId = `C${1000 + seq}`; // Starts from C1001
    const previousInvoices = await mongoose.model('CodInvoice').find({
      userName: this.userName,
      status: 'UnPaid',
    });
    const previousBalance = previousInvoices.reduce((sum, inv) => sum + inv.codAmount, 0);
    this.unpaidBalance = this.codAmount + previousBalance;
  }
  next();
});

// 🔹 Optimized Indexes
// codInvoiceSchema.index({ codInvoiceId: 1 });       // Fast lookup by Invoice ID
codInvoiceSchema.index({ userName: 1 });           // User-based queries
// codInvoiceSchema.index({ trackNumber: 1 });        // TrackNumber lookup
codInvoiceSchema.index({ status: 1 });             // Status queries
codInvoiceSchema.index({ payableStatus: 1 });      // Payable filter
codInvoiceSchema.index({ deliveryDate: 1 });       // Delivery date filters

// Compound Indexes (optional, if these queries are common)
codInvoiceSchema.index({ userName: 1, status: 1 });
codInvoiceSchema.index({ userName: 1, payableStatus: 1 });
codInvoiceSchema.index({ codInvoiceId: 1 }); // uncomment karo
codInvoiceSchema.index({ trackNumber: 1 });   // yeh bhi uncomment karo
codInvoiceSchema.index({ orderStatus: 1, createdAt: -1 });
codInvoiceSchema.index({ orderStatus: 1, deliveryDate: 1 });

// Backfill enriched fields indexes
codInvoiceSchema.index({ lastEnriched: 1 });
codInvoiceSchema.index({ orderStatus: 1, deliveryDate: -1, companyName: 1 });
codInvoiceSchema.index({ orderStatus: 1, status: 1, deliveryDate: -1 });
codInvoiceSchema.index({ orderStatus: 1, payableStatus: 1, deliveryDate: -1 });
codInvoiceSchema.index({ userName: 1, orderStatus: 1, deliveryDate: -1 });

const CodInvoice = mongoose.model('CodInvoice', codInvoiceSchema, 'CodInvoice');

export { CodInvoice, CodCounter };