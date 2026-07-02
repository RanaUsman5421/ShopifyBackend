import crypto from "crypto";
import mongoose from "mongoose";

import DashboardUser from "../models/DashboardUser.js";
import Store from "../models/Store.js";
import Order from "../models/Order.js";

const sampleUsers = [
  {
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    username: "ayesha",
    address: "Model Town, Lahore",
    password: "ayeshaPass123",
  },
  {
    name: "Hamza Ali",
    email: "hamza@example.com",
    username: "hamza",
    address: "Gulshan-e-Iqbal, Karachi",
    password: "hamzaPass123",
  },
  {
    name: "Sara Malik",
    email: "sara@example.com",
    username: "sara",
    address: "Blue Area, Islamabad",
    password: "saraPass123",
  },
];

const AUTH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const AUTH_SECRET = process.env.DASHBOARD_AUTH_SECRET || "local-dashboard-auth-secret";
const STORE_SETTING_OPTIONS = {
  defaultCourier: ["M&P", "Leopards", "TCS", "BarqRaftaar", "Trax"],
  orderBooking: ["Auto", "Manual"],
};
const DEFAULT_STORE_SETTINGS = {
  defaultCourier: "M&P",
  defaultWeight: "0.5",
  orderBooking: "Manual",
};

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createLinkToken() {
  return `sdu_${crypto.randomBytes(24).toString("base64url")}`;
}

function assignLinkToken(user) {
  const token = createLinkToken();

  user.linkTokenHash = hashToken(token);
  user.linkTokenPreview = `${token.slice(0, 8)}...${token.slice(-6)}`;
  user.tokenGeneratedAt = new Date();
  user.tokenUsedAt = null;

  return token;
}

function safeUser(user) {
  const safe = typeof user.toSafeJSON === "function" ? user.toSafeJSON() : user;

  return {
    ...safe,
    shopifyStores: normalizeUserStores(safe),
  };
}

function normalizeStoreSettings(settings) {
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...(settings || {}),
  };
}

function normalizeStoreKey(value) {
  return String(value || "").trim().toLowerCase();
}

async function getOrdersFromMongoDB(linkedStore, store = null) {
  try {
    const shopDomain = normalizeStoreKey(linkedStore?.shopDomain || store?.shopDomain);
    const storeName = String(linkedStore?.storeName || store?.storeName || "").trim();
    const filters = [];

    if (store?._id) {
      filters.push({ storeId: store._id });
    }

    if (shopDomain) {
      filters.push({ shopDomain });
    }

    if (storeName) {
      filters.push({ storeName });
    }

    if (filters.length === 0) {
      return [];
    }

    const query = filters.length === 1 ? filters[0] : { $or: filters };
    const orders = await Order.find(query)
      .sort({ createdAt: -1, orderNumber: -1 })
      .lean()
      .maxTimeMS(10000);

    if (orders.length > 0) {
      return orders;
    }

    if (!mongoose.connection.db) {
      return [];
    }

    const legacyRecord = await mongoose.connection.db.collection("Orders").findOne({
      ...query,
      orders: { $type: "array" },
    });

    if (Array.isArray(legacyRecord?.orders)) {
      return legacyRecord.orders;
    }

    return Array.isArray(store?.orders) ? store.orders : [];
  } catch (error) {
    console.error("Error fetching orders from MongoDB:", error);
    return [];
  }
}

function normalizeUserStores(user) {
  const safe = typeof user.toObject === "function" ? user.toObject() : user;
  const stores = Array.isArray(safe.shopifyStores) ? [...safe.shopifyStores] : [];

  const normalizedStores = [];
  const seenStoreKeys = new Set();

  function pushUniqueStore(store) {
    if (!store || !store.shopDomain) {
      return;
    }

    const normalizedShopDomain = normalizeStoreKey(store.shopDomain);
    const normalizedStoreName = normalizeStoreKey(store.storeName || store.shopDomain);
    const dedupeKey = `${normalizedShopDomain}|${normalizedStoreName}`;

    if (seenStoreKeys.has(dedupeKey)) {
      return;
    }

    seenStoreKeys.add(dedupeKey);
    normalizedStores.push({
      _id: store._id,
      shopDomain: store.shopDomain,
      storeName: store.storeName || store.shopDomain,
      linkedAt: store.linkedAt,
    });
  }

  for (const store of stores) {
    pushUniqueStore(store);
  }

  if (safe.shopify?.connected && safe.shopify.shopDomain) {
    pushUniqueStore({
      shopDomain: safe.shopify.shopDomain,
      storeName: safe.shopify.storeName || safe.shopify.shopDomain,
      linkedAt: safe.shopify.linkedAt,
    });
  }

  return normalizedStores;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: crypto.scryptSync(password, salt, 64).toString("hex"),
  };
}

function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) {
    return false;
  }

  const { hash } = hashPassword(password, salt);
  const received = Buffer.from(hash, "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signTokenPayload(payload) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
}

function createAuthToken(user) {
  const payload = base64UrlJson({
    userId: user._id.toString(),
    username: user.username,
    exp: Date.now() + AUTH_TOKEN_TTL_MS,
  });

  return `${payload}.${signTokenPayload(payload)}`;
}

function readAuthToken(token) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature || signature !== signTokenPayload(payload)) {
    return null;
  }

  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  return data.exp > Date.now() ? data : null;
}

function assignPassword(user, password) {
  const { hash, salt } = hashPassword(password);
  user.passwordHash = hash;
  user.passwordSalt = salt;
}

function createUsername(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function usernameFromEmail(email) {
  return createUsername(email.split("@")[0] || email);
}

function normalizeDefaultWeight(value) {
  const weight = String(value || "").trim();

  if (!/^\d+(\.\d{1,2})?$/.test(weight)) {
    return null;
  }

  const numericWeight = Number(weight);

  if (!Number.isFinite(numericWeight) || numericWeight <= 0 || numericWeight > 1000) {
    return null;
  }

  return String(numericWeight);
}

function storeSettingsMatch(savedSettings, requestedSettings) {
  const normalizedSavedSettings = normalizeStoreSettings(savedSettings);

  return (
    normalizedSavedSettings.defaultCourier === requestedSettings.defaultCourier &&
    normalizedSavedSettings.defaultWeight === requestedSettings.defaultWeight &&
    normalizedSavedSettings.orderBooking === requestedSettings.orderBooking
  );
}

async function findStoreDocumentForLinkedStore(linkedStore) {
  if (!linkedStore) {
    return null;
  }

  const shopDomain = normalizeStoreKey(linkedStore.shopDomain);
  const storeName = String(linkedStore.storeName || "").trim();
  const filters = [];

  if (shopDomain) {
    filters.push({ shopDomain });
  }

  if (storeName) {
    filters.push({ storeName });
  }

  if (filters.length === 0) {
    return null;
  }

  const stores = await Store.find(filters.length === 1 ? filters[0] : { $or: filters })
    .lean()
    .maxTimeMS(10000);

  return (
    stores.find((store) => normalizeStoreKey(store.shopDomain) === shopDomain) ||
    stores[0] ||
    null
  );
}

async function buildStorePayload(linkedStore) {
  const store = await findStoreDocumentForLinkedStore(linkedStore);
  const orders = await getOrdersFromMongoDB(linkedStore, store);

  if (!store) {
    return {
      shopDomain: linkedStore?.shopDomain || null,
      storeName: linkedStore?.storeName || linkedStore?.shopDomain || null,
      orders,
      settings: normalizeStoreSettings(),
      updatedAt: null,
      linkedAt: linkedStore?.linkedAt || null,
    };
  }

  return {
    _id: store._id,
    shopDomain: store.shopDomain || linkedStore?.shopDomain || null,
    storeName: store.storeName,
    orders,
    settings: normalizeStoreSettings(store.settings),
    updatedAt: store.updatedAt,
    linkedAt: linkedStore?.linkedAt || null,
  };
}

async function buildUserShopifyDataResponse(user, selectedStoreKey = "") {
  const linkedStores = normalizeUserStores(user);
  const stores = await Promise.all(linkedStores.map(buildStorePayload));
  const normalizedSelectedKey = normalizeStoreKey(selectedStoreKey);
  const selectedStore =
    stores.find((store) => {
      const storeId = store._id ? String(store._id) : "";
      return (
        normalizeStoreKey(store.shopDomain) === normalizedSelectedKey ||
        normalizeStoreKey(store.storeName) === normalizedSelectedKey ||
        storeId === normalizedSelectedKey
      );
    }) ||
    stores[0] ||
    null;

  return {
    user: safeUser(user),
    stores,
    store: selectedStore,
  };
}

async function upsertLinkedStoreDocument({ shopDomain, storeName, dashboardUserId }) {
  const normalizedShopDomain = normalizeStoreKey(shopDomain);
  const normalizedStoreName = String(storeName || shopDomain || "").trim();

  if (!normalizedShopDomain || !normalizedStoreName) {
    return null;
  }

  const update = {
    $set: {
      shopDomain: normalizedShopDomain,
      storeName: normalizedStoreName,
      dashboardUserId,
    },
    $setOnInsert: {
      settings: DEFAULT_STORE_SETTINGS,
    },
  };

  const existingStore = await Store.findOne({
    $or: [
      { shopDomain: normalizedShopDomain },
      { storeName: normalizedStoreName },
    ],
  }).maxTimeMS(10000);

  if (existingStore) {
    return Store.findByIdAndUpdate(existingStore._id, update, {
      new: true,
      runValidators: true,
    });
  }

  try {
    return await Store.findOneAndUpdate(
      { shopDomain: normalizedShopDomain },
      update,
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    );
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const duplicateStore = await Store.findOne({
      $or: [
        { shopDomain: normalizedShopDomain },
        { storeName: normalizedStoreName },
      ],
    }).maxTimeMS(10000);

    if (!duplicateStore) {
      throw error;
    }

    return Store.findByIdAndUpdate(duplicateStore._id, update, {
      new: true,
      runValidators: true,
    });
  }
}

export const requireDashboardAuth = async (req, res, next) => {
  try {
    const authHeader = req.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    const payload = token ? readAuthToken(token) : null;

    if (!payload?.userId) {
      return res.status(401).json({
        success: false,
        message: "Login is required",
      });
    }

    const user = await DashboardUser.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Login is required",
      });
    }

    req.dashboardUser = user;
    next();
  } catch (error) {
    console.error("Error checking dashboard auth:", error);

    return res.status(401).json({
      success: false,
      message: "Login is required",
    });
  }
};

export const seedDashboardUsers = async (_req, res) => {
  try {
    for (const sampleUser of sampleUsers) {
      const existingUser = await DashboardUser.findOne({ email: sampleUser.email }).select(
        "+passwordHash +passwordSalt"
      );

      if (existingUser) {
        if (!existingUser.username) {
          existingUser.username = sampleUser.username;
        }

        assignPassword(existingUser, sampleUser.password);

        await existingUser.save();
      } else {
        const user = new DashboardUser({
          name: sampleUser.name,
          email: sampleUser.email,
          username: sampleUser.username,
          address: sampleUser.address,
        });

        assignPassword(user, sampleUser.password);
        await user.save();
      }
    }

    const users = await DashboardUser.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(safeUser),
    });
  } catch (error) {
    console.error("Error seeding dashboard users:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to seed dashboard users",
    });
  }
};

export const loginDashboardUser = async (req, res) => {
  try {
    const username = createUsername(req.body.username || "");
    const password = req.body.password || "";

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username and password are required",
      });
    }

    const user = await DashboardUser.findOne({ username }).select("+passwordHash +passwordSalt");

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    return res.status(200).json({
      success: true,
      token: createAuthToken(user),
      data: safeUser(user),
    });
  } catch (error) {
    console.error("Error logging in dashboard user:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const getMyDashboardUserShopifyData = async (req, res) => {
  try {
    const selectedStoreKey =
      req.query.storeId || req.query.shopDomain || req.query.storeName || "";

    return res.status(200).json({
      success: true,
      data: await buildUserShopifyDataResponse(req.dashboardUser, selectedStoreKey),
    });
  } catch (error) {
    console.error("Error fetching logged in user Shopify data:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Shopify data",
    });
  }
};

export const getDashboardUsers = async (_req, res) => {
  try {
    const users = await DashboardUser.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(safeUser),
    });
  } catch (error) {
    console.error("Error fetching dashboard users:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard users",
    });
  }
};

export const createDashboardUser = async (req, res) => {
  try {
    const { name, email, username, address } = req.body;

    if (!name?.trim() || !email?.trim() || !address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "name, email, and address are required",
      });
    }

    const user = await DashboardUser.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: username?.trim()
        ? createUsername(username)
        : usernameFromEmail(email.trim().toLowerCase()),
      address: address.trim(),
    });

    return res.status(201).json({
      success: true,
      data: safeUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email or username already exists",
      });
    }

    console.error("Error creating dashboard user:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create dashboard user",
    });
  }
};

export const generateDashboardUserToken = async (req, res) => {
  try {
    const user = await DashboardUser.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = assignLinkToken(user);
    await user.save();

    return res.status(200).json({
      success: true,
      token,
      data: safeUser(user),
    });
  } catch (error) {
    console.error("Error generating dashboard user token:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
};

export const generateMyDashboardUserToken = async (req, res) => {
  try {
    const token = assignLinkToken(req.dashboardUser);
    await req.dashboardUser.save();

    return res.status(200).json({
      success: true,
      token,
      data: safeUser(req.dashboardUser),
    });
  } catch (error) {
    console.error("Error generating logged in dashboard user token:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
};

export const linkShopifyStoreByToken = async (req, res) => {
  try {
    const { token, shopDomain, storeName, shopifyAccessToken } = req.body;

    if (!token?.trim() || !shopDomain?.trim()) {
      return res.status(400).json({
        success: false,
        message: "token and shopDomain are required",
      });
    }

    const user = await DashboardUser.findOne({
      linkTokenHash: hashToken(token.trim()),
    }).select("+shopify.accessToken +shopifyStores.accessToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (!Array.isArray(user.shopifyStores)) {
      user.shopifyStores = [];
    }

    const normalizedShopDomain = normalizeStoreKey(shopDomain);
    const normalizedStoreName = storeName?.trim() || shopDomain.trim();
    const existingStore = user.shopifyStores.find(
      (store) => normalizeStoreKey(store.shopDomain) === normalizedShopDomain
    );
    const linkedAt = new Date();

    if (existingStore) {
      existingStore.storeName = normalizedStoreName;
      existingStore.accessToken = shopifyAccessToken?.trim() || existingStore.accessToken || null;
      existingStore.linkedAt = linkedAt;
    } else {
      user.shopifyStores.push({
        shopDomain: normalizedShopDomain,
        storeName: normalizedStoreName,
        accessToken: shopifyAccessToken?.trim() || null,
        linkedAt,
      });
    }

    user.markModified("shopifyStores");

    if (!user.shopify?.connected) {
      user.shopify = {
        connected: true,
        shopDomain: normalizedShopDomain,
        storeName: normalizedStoreName,
        accessToken: shopifyAccessToken?.trim() || null,
        linkedAt,
      };
    } else if (
      normalizeStoreKey(user.shopify.shopDomain) === normalizedShopDomain ||
      normalizeStoreKey(user.shopify.storeName) === normalizeStoreKey(normalizedStoreName)
    ) {
      user.shopify = {
        ...user.shopify,
        connected: true,
        shopDomain: normalizedShopDomain,
        storeName: normalizedStoreName,
        accessToken: shopifyAccessToken?.trim() || user.shopify.accessToken || null,
        linkedAt,
      };
    }

    user.tokenUsedAt = new Date();
    await user.save({ validateModifiedOnly: true });

    try {
      await upsertLinkedStoreDocument({
        shopDomain: normalizedShopDomain,
        storeName: normalizedStoreName,
        dashboardUserId: user._id,
      });
    } catch (storeError) {
      console.error("Error updating linked store document:", storeError);
    }

    let data = {
      user: safeUser(user),
      stores: [],
      store: null,
    };

    try {
      data = await buildUserShopifyDataResponse(user, normalizedShopDomain);
    } catch (payloadError) {
      console.error("Error building linked store response:", payloadError);
      data.user = safeUser(user);
    }

    return res.status(200).json({
      success: true,
      message: "Shopify store linked successfully",
      data: data.user,
      stores: data.stores,
      store: data.store,
    });
  } catch (error) {
    console.error("Error linking Shopify store:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to link Shopify store",
    });
  }
};

export const disconnectMyShopifyStore = async (req, res) => {
  try {
    const storeKey = normalizeStoreKey(
      req.params.storeKey || req.body.shopDomain || req.body.storeName || req.body.storeId || ""
    );

    if (!storeKey) {
      return res.status(400).json({
        success: false,
        message: "A store identifier is required",
      });
    }

    req.dashboardUser.shopifyStores = req.dashboardUser.shopifyStores.filter((store) => {
      const storeId = store._id ? String(store._id) : "";
      return (
        normalizeStoreKey(store.shopDomain) !== storeKey &&
        normalizeStoreKey(store.storeName) !== storeKey &&
        storeId !== storeKey
      );
    });

    const remainingStores = (req.dashboardUser.shopifyStores || []).map((store) => ({
      _id: store._id,
      shopDomain: store.shopDomain,
      storeName: store.storeName,
      linkedAt: store.linkedAt,
    }));
    const primaryStore = remainingStores[0] || null;
    req.dashboardUser.shopify = primaryStore
      ? {
          connected: true,
          shopDomain: primaryStore.shopDomain,
          storeName: primaryStore.storeName,
          accessToken: null,
          linkedAt: primaryStore.linkedAt || new Date(),
        }
      : {
          connected: false,
          shopDomain: null,
          storeName: null,
          accessToken: null,
          linkedAt: null,
        };
    await req.dashboardUser.save();

    const data = await buildUserShopifyDataResponse(req.dashboardUser);

    return res.status(200).json({
      success: true,
      message: "Shopify store disconnected successfully",
      data,
    });
  } catch (error) {
    console.error("Error disconnecting Shopify store:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to disconnect Shopify store",
    });
  }
};

export const updateMyStoreSettings = async (req, res) => {
  try {
    const body = req.body || {};
    const requestSettings =
      body.settings && typeof body.settings === "object" ? body.settings : body;

    const storeKey = normalizeStoreKey(
      req.params.storeKey || body.shopDomain || body.storeName || body.storeId || ""
    );

    if (!storeKey) {
      return res.status(400).json({
        success: false,
        message: "A store identifier is required",
      });
    }

    const linkedStore = normalizeUserStores(req.dashboardUser).find((store) => {
      const storeId = store._id ? String(store._id) : "";
      return (
        normalizeStoreKey(store.shopDomain) === storeKey ||
        normalizeStoreKey(store.storeName) === storeKey ||
        storeId === storeKey
      );
    });

    if (!linkedStore) {
      return res.status(404).json({
        success: false,
        message: "Connected store not found for this user",
      });
    }

    let existingStoreDoc = null;
    let existingSettings = normalizeStoreSettings();
    try {
      existingStoreDoc = await findStoreDocumentForLinkedStore(linkedStore);
      existingSettings = existingStoreDoc ? normalizeStoreSettings(existingStoreDoc.settings) : existingSettings;
    } catch (error) {
      existingSettings = normalizeStoreSettings();
    }

    const nextSettings = {
      defaultCourier: requestSettings.defaultCourier ?? existingSettings.defaultCourier,
      defaultWeight: requestSettings.defaultWeight ?? existingSettings.defaultWeight,
      orderBooking: requestSettings.orderBooking ?? existingSettings.orderBooking,
    };

    const normalizedWeight = normalizeDefaultWeight(nextSettings.defaultWeight);
    if (!normalizedWeight) {
      return res.status(400).json({
        success: false,
        message: "Invalid defaultWeight setting",
      });
    }

    nextSettings.defaultWeight = normalizedWeight;

    for (const [key, value] of Object.entries(nextSettings)) {
      if (key !== "defaultWeight" && !(Array.isArray(STORE_SETTING_OPTIONS[key]) && STORE_SETTING_OPTIONS[key].includes(value))) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${key} setting`,
        });
      }
    }

    const normalizedShopDomain = normalizeStoreKey(linkedStore.shopDomain);
    const queryObj = existingStoreDoc?._id
      ? { _id: existingStoreDoc._id }
      : { shopDomain: normalizedShopDomain };

    const updateObj = {
      $set: {
        shopDomain: normalizedShopDomain,
        storeName: linkedStore.storeName,
        dashboardUserId: req.dashboardUser._id,
        settings: nextSettings,
      },
    };

    const store = await Store.findOneAndUpdate(queryObj, updateObj, {
      new: true,
      runValidators: true,
      upsert: !existingStoreDoc,
    });

    if (!store) {
      return res.status(500).json({
        success: false,
        message: "Store settings were not saved",
      });
    }

    const persistedStore = await Store.findById(store._id).lean().maxTimeMS(10000);

    if (!persistedStore || !storeSettingsMatch(persistedStore.settings, nextSettings)) {
      return res.status(500).json({
        success: false,
        message: "Store settings could not be verified in MongoDB",
      });
    }

    const orders = await getOrdersFromMongoDB(linkedStore, store);

    return res.status(200).json({
      success: true,
      message: "Store settings updated successfully",
      data: {
        user: safeUser(req.dashboardUser),
        store: {
          _id: store._id,
          shopDomain: store.shopDomain,
          storeName: store.storeName,
          orders,
          settings: normalizeStoreSettings(persistedStore.settings),
          updatedAt: persistedStore.updatedAt,
          linkedAt: linkedStore.linkedAt || null,
        },
      },
    });
  } catch (error) {
    console.error("Error updating store settings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update store settings",
    });
  }
};

export const getDashboardUserShopifyData = async (req, res) => {
  try {
    const user = await DashboardUser.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const selectedStoreKey =
      req.query.storeId || req.query.shopDomain || req.query.storeName || "";

    return res.status(200).json({
      success: true,
      data: await buildUserShopifyDataResponse(user, selectedStoreKey),
    });
  } catch (error) {
    console.error("Error fetching dashboard user Shopify data:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Shopify data",
    });
  }
};

export const getDashboardUserShopifyDataByEmail = async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    const user = await DashboardUser.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: await buildUserShopifyDataResponse(
        user,
        req.query.storeId || req.query.shopDomain || req.query.storeName || ""
      ),
    });
  } catch (error) {
    console.error("Error fetching dashboard user Shopify data by email:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Shopify data",
    });
  }
};

export const getDashboardUserShopifyDataByUsername = async (req, res) => {
  try {
    const username = createUsername(decodeURIComponent(req.params.username || ""));

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required",
      });
    }

    const user = await DashboardUser.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: await buildUserShopifyDataResponse(
        user,
        req.query.storeId || req.query.shopDomain || req.query.storeName || ""
      ),
    });
  } catch (error) {
    console.error("Error fetching dashboard user Shopify data by username:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Shopify data",
    });
  }
};

