// src/controllers/mock.controller.ts
import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { ProductMockData } from "../types/product.type";

const getMockData = async (filename: string) => {
  const filePath = path.join(__dirname, "..", "mock", filename);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
};

function PriceFilter(
  products: ProductMockData[],
  minPrice?: string,
  maxPrice?: string
) {
  if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter((p) => p.price <= Number(maxPrice));
  return products;
}

function priceSort(products: ProductMockData[], sort?: string) {
  if (sort === "price") {
    products = products.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  } else if (sort === "-price") {
    products = products.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  } else if (sort === "review") {
    products = products.sort(
      (a, b) => (a.reviewCount ?? 0) - (b.reviewCount ?? 0)
    );
  } else if (sort === "-review") {
    products = products.sort(
      (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
    );
  }
  return products;
}

export const getMockProducts = async (req: Request, res: Response) => {
  const { sort, minPrice, maxPrice } = req.query;

  // query 파라미터 타입 가드로 변수 정리
  const s = typeof sort === "string" ? sort : undefined;
  const min = typeof minPrice === "string" ? minPrice : undefined;
  const max = typeof maxPrice === "string" ? maxPrice : undefined;
  try {
    const data = await getMockData("mockProducts.json");
    let products: ProductMockData[] = data;
    // 필터: 최소/최대 가격
    products = PriceFilter(products, min, max);
    // 정렬: price, reviewCount 등
    products = priceSort(products, s);

    res.json({ total: products.length, data: products });
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockProducts 로드 실패", detail: String(err) });
  }
};

export const getMockFavorites = async (req: Request, res: Response) => {
  const { sort, minPrice, maxPrice } = req.query;

  // query 파라미터 타입 가드로 변수 정리
  const s = typeof sort === "string" ? sort : undefined;
  const min = typeof minPrice === "string" ? minPrice : undefined;
  const max = typeof maxPrice === "string" ? maxPrice : undefined;

  try {
    const data = await getMockData("mockFavorites.json");
    let products: ProductMockData[] = data;
    // 필터: 최소/최대 가격
    products = PriceFilter(products, min, max);
    // 정렬: price, reviewCount 등
    products = priceSort(products, s);

    res.json({ total: products.length, data: products });
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockFavorites 로드 실패", detail: String(err) });
  }
};

export const getMockNotifications = async (req: Request, res: Response) => {
  const { sort, minPrice, maxPrice } = req.query;

  // query 파라미터 타입 가드로 변수 정리
  const s = typeof sort === "string" ? sort : undefined;
  const min = typeof minPrice === "string" ? minPrice : undefined;
  const max = typeof maxPrice === "string" ? maxPrice : undefined;

  try {
    const data = await getMockData("mockNotifications.json");
    let products: ProductMockData[] = data;
    // 필터: 최소/최대 가격
    products = PriceFilter(products, min, max);
    // 정렬: price, reviewCount 등
    products = priceSort(products, s);

    res.json({ total: products.length, data: products });
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockNotifications 로드 실패", detail: String(err) });
  }
};
