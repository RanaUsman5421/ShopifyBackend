import mongoose from "mongoose";
const buyerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true, // Still required because every user needs a full name
      
    },
    displayName: {
      type: String,
      // required: true, // Still required because every user needs a full name
      unique: true, // Ensure brand name is unique
      
    },
    email: {
      type: String,
      required: true, // Still required because email is mandatory
    },
    password: {
      type: String,
      required: true, // Still required because password is mandatory
    },
    image: {
      type: String,
    },
    
    selfie: {
      type: String,
    },
    cnicFront: {
      type: String,
    },
    cnicBack: {
      type: String,
    },
    businessPhotos:{
      type: [String],
      default: [],
    },
    userName: {
      type: String,
      
    },
    fatherName: {
      type: String,
      // required: true, // Still required because father name is mandatory
    },
    cnic: {
      type: String,
      // required: true, // Still required because CNIC is mandatory
    },
    exactLocation: {
      type: String,
      // required: true, // Still required because exact location is mandatory
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "CEO"], // Enum roles
      default: "buyer", // Default to "buyer" unless explicitly specified
    },
    country: {
      type: String, // Optional, can be left blank
    },
    phoneNumber: {
      type: String, // Optional, can be left blank
    },
    profession: {
      type: [String], // Changed to array of strings
    },
    portfolio: {
      type: [String], // Optional, array of project links for sellers
    },
    description: {
      type: String, // Optional, description for sellers
    },
    dateOfBirth: {
      type: String, // Optional, description for sellers
    },
    companyName: {
      type: String, // Optional, description for sellers
    },
    contectPerson: {
      type: String, // Optional, description for sellers
    },
    siteUrl: {
      type: String, // Optional, description for sellers
    },
    storeName: {
      type: String, // Optional, description for sellers
    },
    stateOrProvince: {
      type: String, // Optional, description for sellers
    },
    city: {
      type: String, // Optional, description for sellers
    },
    postalCode: {
      type: String, // Optional, description for sellers
    },
    accessApproved: {
      type: Boolean,
      default: false, // Default to not approved
    },
    isTeam: {
      type: Boolean,
      default: false, // Default to not approved
    },
    teamName: {
      type: String,
      
    },
    comingFrom: {
      type: String,
      
    },
      super: {
  isSupperShipper: { type: Boolean, default: false },
},
    shipperTemplateId: { type: String },
    accessRequests: {
      type: [
        {
          text: { type: String },
          route: { type: String },
          icon: { type: Object, default: {} }, // Adjust as needed
          items: { type: [Object], default: [] },
        },
      ],
    },
    loginAccess:{type: Boolean, default:true }, // Default to not having login access
    blockDate: { type: Date },
    unBlockDate: { type: Date },
    workingStatus: {
      type: String,
      default: "Excellent", // Default to "active" unless explicitly specified
    },
    
    // new fields
    dob:{
      type: String,
    },
    address:{
      type: String,
    },
    shortIds: {
  type: [String],
},

   
    adminAccess:{
      type: Boolean,
      default: false,
    },
    cast:{
      type: String,
      
    },
    religion:{
      type: String,
     
    },
    gender:{
      type: String,
      
    },
    cv:{
      type: String,
      
    },
    shippersUserNames: {
      type: [String], // Array of usernames for assigned shippers
     
    },
    
    // New fields for password reset
    resetPasswordToken: {
      type: String,
      
    },
    resetPasswordExpires: {
      type: Date,
    },
     refredBy:{   
      type: [String],
    },
   
  },
  { timestamps: true }
);

export const BuyerAndSeller = mongoose.model("BuyerAndSeller", buyerSchema);