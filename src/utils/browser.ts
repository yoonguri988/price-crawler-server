/**
 * @description Puppeteer 브라우저 관리
 */
import puppeteer, { Browser } from "puppeteer";

export const getBrowser = async (): Promise<Browser> => {
  const isRender = process.env.RENDER === "true"; // 환경변수로 플랫폼 구분
  const executablePath = isRender
    ? "/opt/render/.cache/puppeteer/chrome/linux-*/chrome"
    : puppeteer.executablePath();

  return await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};
