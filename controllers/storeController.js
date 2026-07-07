import Store from "../models/Store.js";
import shopifyOrdersModal from '../models/shopifyOrders.modal.js';

function normalizeStoreKey(value) {
  return String(value || "").trim().toLowerCase();
}

async function getOrdersForStore(store) {
  const filters = [];

  if (store?._id) {
    filters.push({ storeId: store._id });
  }

  if (store?.shopDomain) {
    filters.push({ shopDomain: normalizeStoreKey(store.shopDomain) });
  }

  if (store?.storeName) {
    filters.push({ storeName: store.storeName });
  }

  if (filters.length === 0) {
    return Array.isArray(store?.orders) ? store.orders : [];
  }

  const orders = await ShopifyOrders.find(filters.length === 1 ? filters[0] : { $or: filters })
    .sort({ createdAt: -1, orderNumber: -1 })
    .lean()
    .maxTimeMS(10000);

  if (orders.length > 0) {
    return orders;
  }

  return Array.isArray(store?.orders) ? store.orders : [];
}

async function attachOrders(store) {
  return {
    ...store,
    orders: await getOrdersForStore(store),
  };
}

export const getAllStoresData = async (req, res) => {
  try {
    const stores = await Store.find({}).lean().maxTimeMS(10000);
    const storesWithOrders = await Promise.all(stores.map(attachOrders));

    return res.status(200).json({
      success: true,
      count: storesWithOrders.length,
      data: storesWithOrders,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
    });
  }
};

export const getStoreData = async (req, res) => {
  try {
    const { storeName } = req.params;

    if (!storeName || !storeName.trim()) {
      return res.status(400).json({
        success: false,
        message: "storeName is required",
      });
    }

    const trimmedStoreName = storeName.trim();
    const normalizedStoreKey = normalizeStoreKey(trimmedStoreName);
    const stores = await Store.find({
      $or: [
        { storeName: trimmedStoreName },
        { shopDomain: normalizedStoreKey },
      ],
    })
      .lean()
      .maxTimeMS(10000);
    const store = stores[0];

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: await attachOrders(store),
    });
  } catch (error) {
    console.error("Error fetching store:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store",
    });
  }
};
