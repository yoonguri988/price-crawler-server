import { Router, Request, Response } from "express";
import { getDanawaPrice } from "../utils/browser";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    const result = await getDanawaPrice(query);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to crawl" });
  }
});

export default router;
