import express from "express";
import { autoBookShopifyOrders } from "../controllers/AutoBooking.controller.js";

const router = express.Router();

router.get("/test-auto-book", async (req, res) => {
  await autoBookShopifyOrders();
  res.json({ done: true });
});

export default router;