import express from "express";
import cors from "cors";
import danawaRouter from "./routes/danawa";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/danawa", danawaRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
