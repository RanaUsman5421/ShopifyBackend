import mongoose from 'mongoose';

const zoneEntrySchema = new mongoose.Schema({
  weightRange: { type: String, required: true },
  amount: { type: Number, required: true },
});

const zoneSchema = new mongoose.Schema({
  name: { type: String, enum: ['Zone A', 'Zone B', 'Zone C', 'Zone D'], required: true },
  entries: [zoneEntrySchema], // Array of weightRange and amount entries
});
const notificationSchema = new mongoose.Schema({
  numbers: [{ type: String}], // Array of phone numbers
  profileId: { type: String}, // Selected profile ID
  templates: [{ type: String}], // Array of template IDs (e.g., 'booked')
  createdAt: { type: Date, default: Date.now }, // Timestamp
});
const shipperNotificationSchema = new mongoose.Schema({
  profileId: { type: String }, // Changed from profileId
  templates: [{ type: String }], // Changed from templates
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const shipperSchema = new mongoose.Schema({
  userName: { type: String, required: true, index: true },
  leopardsId: { type: Number },
  mnpSubAccountId: { type: Number }, // Stores MNP SubAccountId
  mnpLocationId: { type: Number }, // Stores MNP LocationId
  traxId: { type: Number },
  shipperName: { type: String, required: true },
  isShipperBlocked: { type: Boolean, default: false },
   isDefaultShipper: { type: Boolean, default: false },
  shipperEmail: { type: String },
  shipperPhone: { type: String, required: true },
  shipperCnic: { type: String },
  leopardsCityId: { type: Number },
  leopardsCityName: { type: String },
  mnpCityName: { type: String }, 
  mnpAddress: { type: String },
  traxCityId: { type: Number },
  traxCityName: { type: String },
  area: { type: String },
  block: { type: String },
  leopardsAddress: { type: String },
  traxAddress: { type: String },
 
  settleShipper: { type: Boolean, default: false },
  iban: { type: String },
  accountNo: { type: String },
  bankId: { type: Number },
  bankAccountTitle: { type: String },
  bankBranch: { type: String },
  zones: [zoneSchema],
  daakCityId: { type: Number, default: null },
daakCityName: { type: String, default: null },
daakAddress: { type: String, default: "" },
daakId: { type: Number, default: null },
  dcinvoiceDaysNames: { type: [String], default: [] },
  // templates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ShipperTemplates' }], // Reference to ShipperTemplates
   template: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ShipperTemplates', 
    default: null
  },
  payableDays: { type: Number, default: 0 }, // Default to 0 days
  notifications: [notificationSchema], // New field for notifications
  shipperNotifications: [shipperNotificationSchema],
  messageCount: { type: Number, default: 0 }, // Track successful messages
  hasAiAccess: { type: Boolean, default: false }, // AI access flag
  createdAt: { type: Date, default: Date.now },
  shortIds: {
    type: [String],
    default: [],
  },
});

export default mongoose.model('Shipper', shipperSchema);