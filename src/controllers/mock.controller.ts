// src/controllers/mock.controller.ts
import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

const getMockData = async (filename: string) => {
  const filePath = path.join(__dirname, "..", "mock", filename);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
};

export const getMockProducts = async (req: Request, res: Response) => {
  try {
    const data = await getMockData("mockProducts.json");
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockProducts 로드 실패", detail: String(err) });
  }
};

export const getMockFavorites = async (req: Request, res: Response) => {
  try {
    const data = await getMockData("mockFavorites.json");
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockFavorites 로드 실패", detail: String(err) });
  }
};

export const getMockNotifications = async (req: Request, res: Response) => {
  try {
    const data = await getMockData("mockNotifications.json");
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockNotifications 로드 실패", detail: String(err) });
  }
};
