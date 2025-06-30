// src/index.ts
import express from "express";
import crawlRouter from "./routes/crawl.route";
import mockRouter from "./routes/mock.route";

const app = express();
const PORT = process.env.PORT || 8080;

app.use("/api/crawl", crawlRouter);
app.use("/api/mock", mockRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running at: ${PORT}`);
});
