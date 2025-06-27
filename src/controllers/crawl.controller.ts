import { Request, Response } from "express";
import { crawlDanawa } from "../services/danawa.service";
// 나중에 다른 사이트 import 추가 예정

export const crawlController = async (req: Request, res: Response) => {
  const { site, query } = req.query;

  if (!site || !query) {
    return res.status(400).json({ error: "Missing site or query parameter" });
  }

  try {
    let data = [];

    switch (site) {
      case "danawa":
        data = await crawlDanawa(query as string);
        break;
      default:
        return res.status(400).json({ error: "Unsupported site" });
    }

    res.json({ site, query, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
