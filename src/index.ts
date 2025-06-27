/**
 * @description Express 서버 진입점
 */
import express from "express";
import cors from "cors";
import crawlRouter from "./routes/crawl.route";

const app = express();
app.use(cors());
app.use("/api", crawlRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
