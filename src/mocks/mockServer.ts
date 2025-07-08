/**
 * MSW 핸들러 설정
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const mockServer = setupServer(...handlers);
