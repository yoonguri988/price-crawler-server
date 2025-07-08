// src/tests/setupTests.ts
import { mockServer } from "../mocks/mockServer";
import { beforeAll, afterEach, afterAll } from "@jest/globals";

// MSW 서버 시작 및 테스트 후 정리
beforeAll(() => mockServer.listen());
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
