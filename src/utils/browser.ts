/**
 * @description Puppeteer 브라우저 관리
 */
import puppeteer, { Browser } from "puppeteer";

export const getBrowser = async (): Promise<Browser> => {
  return await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};
