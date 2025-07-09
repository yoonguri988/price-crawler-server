// src/controllers/mock.controller.ts
import { Request, Response } from "express";
import {
  ProductMockData,
  FavoriteMockData,
  NotificationMockData,
} from "../types/product.type";
/** getMockData JSON */
import mockProducts from "../mocks/mockProducts.json";
import mockFavorites from "../mocks/mockFavorites.json";
import mockNotifications from "../mocks/mockNotifications.json";

const getMockData = async (filename: string) => {
  if (filename === "mockProducts.json") return mockProducts;
  if (filename === "mockFavorites.json") return mockFavorites;
  if (filename === "mockNotifications.json") return mockNotifications;
  return [];
};

/**
 * @description 최소/최대 가격 필터링
 */
const filterByPrice = (
  products: ProductMockData[],
  minPrice?: string,
  maxPrice?: string
) => {
  return products.filter((p) => {
    const price = p.price ?? 0;
    return (
      (!minPrice || price >= Number(minPrice)) &&
      (!maxPrice || price <= Number(maxPrice))
    );
  });
};

/**
 * @description 정렬 필드에 따라 정렬 처리
 */
const sortProducts = (products: ProductMockData[], sort?: string) => {
  switch (sort) {
    case "price":
      return products.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "-price":
      return products.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "review":
      return products.sort(
        (a, b) => (a.reviewCount ?? 0) - (b.reviewCount ?? 0)
      );
    case "-review":
      return products.sort(
        (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
      );
    default:
      return products;
  }
};

const paginate = <T>(data: T[], page: number, limit: number) => {
  const start = (page - 1) * limit;
  return data.slice(start, start + limit);
};

/**
 * @route GET /api/mock/products
 */
export const getMockProducts = (req: Request, res: Response) => {
  const { sort, minPrice, maxPrice, page = "1", limit = "10" } = req.query;
  const s = typeof sort === "string" ? sort : undefined;
  const min = typeof minPrice === "string" ? minPrice : undefined;
  const max = typeof maxPrice === "string" ? maxPrice : undefined;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  try {
    let data: ProductMockData[] = mockProducts;
    data = filterByPrice(data, min, max);
    data = sortProducts(data, s);
    const paged = paginate(data, pageNum, limitNum);

    res.json({
      status: "success",
      message: "mockProducts fetched",
      meta: { total: data.length, page: pageNum, limit: limitNum },
      data: paged,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockProducts 로드 실패", detail: String(err) });
  }
};

/**
 * @route GET /api/mock/favorites
 */
export const getMockFavorites = (req: Request, res: Response) => {
  const { page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  try {
    const data: FavoriteMockData[] = mockFavorites;
    const paged = paginate(data, pageNum, limitNum);
    res.json({
      status: "success",
      message: "mockFavorites fetched",
      meta: { total: data.length, page: pageNum, limit: limitNum },
      data: paged,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockFavorites 로드 실패", detail: String(err) });
  }
};
/**
 * @route GET /api/mock/notifications
 */
export const getMockNotifications = (req: Request, res: Response) => {
  const { page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  try {
    const data: NotificationMockData[] = mockNotifications;
    const paged = paginate(data, pageNum, limitNum);
    res.json({
      status: "success",
      message: "mockNotifications fetched",
      meta: { total: data.length, page: pageNum, limit: limitNum },
      data: paged,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "mockNotifications 로드 실패", detail: String(err) });
  }
};
