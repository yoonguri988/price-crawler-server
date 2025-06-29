// src/index.ts
import express from "express";
import crawlRouter from "./routes/crawl.route";

const app = express();
const PORT = process.env.PORT || 8080;

app.use("/api/crawl", crawlRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running at: ${PORT}`);
});
