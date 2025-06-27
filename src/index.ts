// src/index.ts
import express from "express";
import crawlRouter from "./routes/crawl.route";

const app = express();
const port = 3000;

app.use("/api/crawl", crawlRouter);

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
