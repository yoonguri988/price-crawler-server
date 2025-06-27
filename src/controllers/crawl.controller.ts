// src/controllers/crawl.controller.ts
import { Request, Response } from "express";
import { getEnuriProducts } from "../services/enuri.service";
import { crawlDanawa } from "../services/danawa.service"; // 이미 존재한다고 가정

export const crawlProduct = async (req: Request, res: Response) => {
  const { site, query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query 파라미터가 필요합니다." });
  }

  try {
    let data;
    switch (site) {
      case "enuri":
        data = await getEnuriProducts(query);
        break;
      case "danawa":
        data = await crawlDanawa(query);
        break;
      default:
        return res.status(400).json({ error: "지원하지 않는 site입니다." });
    }

    res.json({ site, data });
  } catch (err) {
    res.status(500).json({
      error: "크롤링 중 오류 발생",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
};
