/**
 * src/routes/crawl.route.ts
 *
 * 라우터: /crawl
 * @param site : 어떤 사이트?
 * @param query : 어떤 내용?
 * @returns /crawl?site=&query
 */
import express from "express";
import { crawlProduct } from "../controllers/crawl.controller";

const router = express.Router();

router.get("/", crawlProduct);

export default router;
