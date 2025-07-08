// 📄 src/tests/mock.controller.test.ts
import request from "supertest";
import express from "express";
import {
  getMockFavorites,
  getMockNotifications,
  getMockProducts,
} from "../controllers/mock.controller";
import { mockServer } from "../mocks/mockServer";

// MSW 서버 시작/종료 설정
// beforeAll(() => mockServer.listen());
// afterEach(() => mockServer.resetHandlers());
// afterAll(() => mockServer.close());

const app = express();
app.use(express.json());
app.get("/api/mock/products", getMockProducts);
app.get("/api/mock/favorites", getMockFavorites);
app.get("/api/mock/notifications", getMockNotifications);

// 기본 구조 반환 테스트
describe("GET /api/mock/products", () => {
  it("should return product list with correct structure", async () => {
    const response = await request(app).get("/api/mock/products");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // 가격 필터(minPrice, maxPrice) 적용 테스트
  it("should apply price filter correctly", async () => {
    const response = await request(app).get(
      "/api/mock/products?minPrice=10000&maxPrice=30000"
    );
    expect(response.status).toBe(200);
    expect(
      response.body.data.every(
        (item: any) => item.price >= 10000 && item.price <= 30000
      )
    ).toBe(true);
  });

  // 리뷰 정렬 테스트 (내림차순)
  it("should sort by review count descending", async () => {
    const response = await request(app).get("/api/mock/products?sort=-review");
    const data = response.body.data;
    expect(data.length).toBeGreaterThan(0);
    for (let i = 1; i < data.length; i++) {
      expect(data[i - 1].reviewCount ?? 0).toBeGreaterThanOrEqual(
        data[i].reviewCount ?? 0
      );
    }
  });

  // 페이징 테스트
  it("should return paged data", async () => {
    const response = await request(app).get(
      "/api/mock/products?page=2&limit=1"
    );
    expect(response.body.meta).toHaveProperty("page", 2);
    expect(response.body.meta).toHaveProperty("limit", 1);
    expect(response.body.data.length).toBeLessThanOrEqual(1);
  });

  // 실패 케이스 테스트 (데이터 파일 없을 때)
  it("should return 500 if data file is missing", async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "test-missing";

    const mockController = await import("../controllers/mock.controller");
    const appWithBrokenFile = express();
    appWithBrokenFile.use(express.json());
    appWithBrokenFile.get("/fail", mockController.getMockProducts);
    const response = await request(appWithBrokenFile).get("/fail");

    expect(response.status).toBe(500);
    process.env.NODE_ENV = original;
  });
});

describe("GET /api/mock/favorites", () => {
  // 즐겨찾기 목록 반환 테스트
  it("should return favorite product list with correct structure", async () => {
    const response = await request(app).get("/api/mock/favorites");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe("GET /api/mock/notifications", () => {
  // 알림 설정 목록 반환 테스트
  it("should return notification product list with correct structure", async () => {
    const response = await request(app).get("/api/mock/notifications");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
