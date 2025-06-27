/**
 * @description Puppeteer 브라우저 관리
 */
import puppeteer, { Browser } from "puppeteer";

export const getBrowser = async (): Promise<Browser> => {
  const executablePath = puppeteer.executablePath(); // ✅ 자동 경로 사용

  return await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};
