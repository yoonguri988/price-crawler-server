/**
 * 라우터: /crawl
 * @param site : 어떤 사이트?
 * @param query : 어떤 내용?
 * @returns /crawl?site=&query
 */
import { Router } from "express";
import { crawlController } from "../controllers/crawl.controller";

const router = Router();
router.get("/crawl", crawlController);

export default router;
