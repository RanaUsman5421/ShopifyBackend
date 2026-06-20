import Store from "../models/Store.js";

function normalizeStoreKey(value) {
  return String(value || "").trim().toLowerCase();
}

export const getAllStoresData = async (req, res) => {
  try {
    const stores = await Store.find({}).lean().maxTimeMS(10000);

    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
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
    const store =
      stores.find((storeItem) => Array.isArray(storeItem.orders) && storeItem.orders.length > 0) ||
      stores[0];

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error("Error fetching store:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store",
    });
  }
};
