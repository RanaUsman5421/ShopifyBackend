import express from "express";
import {
  createDashboardUser,
  disconnectMyShopifyStore,
  generateDashboardUserToken,
  generateMyDashboardUserToken,
  getDashboardUsers,
  getDashboardUserShopifyData,
  getDashboardUserShopifyDataByEmail,
  getDashboardUserShopifyDataByUsername,
  getMyDashboardUserShopifyData,
  loginDashboardUser,
  linkShopifyStoreByToken,
  requireDashboardAuth,
  seedDashboardUsers,
  updateMyStoreSettings,
} from "../controllers/dashboardUserController.js";
import {
  getAllStoresData,
  getStoreData,
} from "../controllers/storeController.js";

const router = express.Router();

router.post("/auth/login", loginDashboardUser);
router.get("/auth/me/shopify-data", requireDashboardAuth, getMyDashboardUserShopifyData);
router.post("/auth/me/token", requireDashboardAuth, generateMyDashboardUserToken);
router.post("/auth/me/disconnect-shopify", requireDashboardAuth, disconnectMyShopifyStore);
router.post("/auth/me/stores/:storeKey/disconnect", requireDashboardAuth, disconnectMyShopifyStore);
router.put("/auth/me/store-settings", requireDashboardAuth, updateMyStoreSettings);
router.put("/auth/me/stores/:storeKey/settings", requireDashboardAuth, updateMyStoreSettings);
router.get("/users", getDashboardUsers);
router.post("/users", createDashboardUser);
router.post("/users/seed", seedDashboardUsers);
router.post("/users/:userId/token", generateDashboardUserToken);
router.get("/users/by-email/:email/shopify-data", getDashboardUserShopifyDataByEmail);
router.get("/users/by-username/:username/shopify-data", getDashboardUserShopifyDataByUsername);
router.get("/users/:userId/shopify-data", getDashboardUserShopifyData);
router.post("/link-token", linkShopifyStoreByToken);

router.get("/stores", getAllStoresData);
router.get("/stores/:storeName", getStoreData);

export default router;
