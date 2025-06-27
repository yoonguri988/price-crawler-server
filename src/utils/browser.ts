/**
 * @description Puppeteer 브라우저 관리
 */
import puppeteer from "puppeteer";

export const getBrowser = async () => {
  const executablePath = puppeteer.executablePath(); // 명시 경로 제거

  console.log("🧪 Render executablePath:", puppeteer.executablePath());

  return await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};
