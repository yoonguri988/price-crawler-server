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

describe("GET /api/mock/products", () => {
  it("should return product list with correct structure", async () => {
    const response = await request(app).get("/api/mock/products");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
describe("GET /api/mock/favorites", () => {
  it("should return favorite product list with correct structure", async () => {
    const response = await request(app).get("/api/mock/favorites");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe("GET /api/mock/notifications", () => {
  it("should return notification product list with correct structure", async () => {
    const response = await request(app).get("/api/mock/notifications");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
