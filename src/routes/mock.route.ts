// src/routes/mock.route.ts
import { Router } from "express";
import {
  getMockFavorites,
  getMockNotifications,
  getMockProducts,
} from "../controllers/mock.controller";

const router = Router();

router.get("/products", getMockProducts);
router.get("/favorites", getMockFavorites);
router.get("/notifications", getMockNotifications);
export default router;
