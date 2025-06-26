import dotenv from "dotenv";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

dotenv.config();

// Render 환경 여부
const isRender = process.env.RENDER === "true";

export const getDanawaPrice = async (query: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: puppeteer.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    await page.goto(
      `https://search.danawa.com/dsearch.php?keyword=${encodeURIComponent(
        query
      )}`,
      { waitUntil: "domcontentloaded" }
    );

    const data = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".prod_main_info"));
      return items.slice(0, 5).map((el) => {
        const title = el.querySelector(".prod_name")?.textContent?.trim();
        const price = el
          .querySelector(".price_sect a strong")
          ?.textContent?.trim();
        return { title, price };
      });
    });

    return data;
  } catch (err) {
    console.error("❌ getDanawaPrice 내부 오류:", err);
    throw err;
  } finally {
    await browser.close();
  }
};
