import mongoose from "mongoose";

const dashboardUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordSalt: {
      type: String,
      default: null,
      select: false,
    },
    linkTokenHash: {
      type: String,
      default: null,
      index: true,
    },
    linkTokenPreview: {
      type: String,
      default: null,
    },
    tokenGeneratedAt: {
      type: Date,
      default: null,
    },
    tokenUsedAt: {
      type: Date,
      default: null,
    },
    shopify: {
      connected: {
        type: Boolean,
        default: false,
      },
      shopDomain: {
        type: String,
        default: null,
        trim: true,
      },
      storeName: {
        type: String,
        default: null,
        trim: true,
      },
      accessToken: {
        type: String,
        default: null,
        select: false,
      },
      linkedAt: {
        type: Date,
        default: null,
      },
    },
    shopifyStores: {
      type: [
        {
          shopDomain: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          storeName: {
            type: String,
            required: true,
            trim: true,
          },
          accessToken: {
            type: String,
            default: null,
            select: false,
          },
          linkedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "DashboardUsers",
  }
);

dashboardUserSchema.methods.toSafeJSON = function toSafeJSON() {
  const user = this.toObject();

  if (user.shopify) {
    delete user.shopify.accessToken;
  }

  if (Array.isArray(user.shopifyStores)) {
    user.shopifyStores = user.shopifyStores.map((store) => {
      const safeStore = { ...store };
      delete safeStore.accessToken;
      return safeStore;
    });
  }

  delete user.linkTokenHash;
  delete user.passwordHash;
  delete user.passwordSalt;
  return user;
};

export default mongoose.model("DashboardUser", dashboardUserSchema);
