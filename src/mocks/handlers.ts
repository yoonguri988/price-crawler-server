/**
 * src/mocks/handlers.ts
 *
 * 요청 응답 정의
 */
import { rest } from "msw";

export const handlers = [
  rest.get("/api/mock/products", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: "success",
        message: "mock products fetched",
        meta: {
          total: 2,
          page: 1,
          limit: 10,
        },
        data: [
          { id: "1", name: "상품1", price: 10000, imageUrl: "" },
          { id: "2", name: "상품2", price: 20000, imageUrl: "" },
        ],
      })
    );
  }),
];
