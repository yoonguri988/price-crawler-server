// src/index.ts
import express from "express";
import cors from "cors";

import crawlRouter from "./routes/crawl.route";
import mockRouter from "./routes/mock.route";

const app = express();
const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(
  cors({
    origin: [CORS_ORIGIN], // or '*' for 전체 허용
    credentials: true,
  })
);

app.use("/api/crawl", crawlRouter);
app.use("/api/mock", mockRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running at: ${PORT}`);
});
