/**
 * @description Puppeteer 브라우저 관리
 */
import puppeteer from "puppeteer";

export const getBrowser = async () => {
  const isRender = process.env.RENDER === "true";

  const executablePath = isRender
    ? "/opt/render/.cache/puppeteer/chrome/linux-138.0.7204.49/chrome-linux64/chrome"
    : puppeteer.executablePath();

  return await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};
