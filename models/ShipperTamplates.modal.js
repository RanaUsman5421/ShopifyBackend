// models/Template.js
import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  entries: [
    {
      courier: { type: String, required: true },
      weight: { type: String, required: true },
      amount: { type: String, required: true }
    }
  ],
  additionalKG: { type: Map, of: String }
});

const typeSchema = new mongoose.Schema({
  WithinCity: zoneSchema,
  ZoneA: zoneSchema,
  ZoneB: zoneSchema,
  ZoneC: zoneSchema
});

const templateSchema = new mongoose.Schema(
  {
    tempName: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['Overnight', 'Detain', 'Overland']
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    zones: {
      Overnight: typeSchema,
      Detain: typeSchema,
      Overland: typeSchema
    },
    date: { type: String, required: true },
    daysAgo: { type: String, required: true },
    displayType:{type: String,required: true },
    counted: { type: Number, required: true },
    couriers: { type: String, required: true }
  },
  { timestamps: true }
);

// Export default model
const ShipperTemplates = mongoose.model('ShipperTemplates', templateSchema);
export default ShipperTemplates;