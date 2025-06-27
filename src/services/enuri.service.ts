// src/services/enuri.service.ts
import { getBrowser } from "../utils/browser";

export const getEnuriProducts = async (query: string) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(
      `https://www.enuri.com/search.jsp?keyword=${encodeURIComponent(query)}`,
      {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      }
    );

    await page.waitForSelector(".listCont", { timeout: 10000 });

    const data = await page.$$eval(".listCont ul li", (nodes) =>
      nodes.slice(0, 10).map((el, idx) => {
        const name = el.querySelector(".title")?.textContent?.trim() ?? "";
        const priceText =
          el.querySelector(".price span")?.textContent?.replace(/[^\d]/g, "") ??
          "0";
        const imageUrl = el.querySelector("img")?.getAttribute("src") ?? "";
        const seller = el.querySelector(".mall")?.textContent?.trim() ?? "";

        return {
          id: `enuri_${idx + 1}`,
          name,
          price: parseInt(priceText),
          imageUrl,
          seller,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return data;
  } catch (err) {
    console.error("🛑 Enuri 크롤링 실패:", err);
    throw new Error("에누리 크롤링 중 오류 발생");
  } finally {
    await browser.close();
  }
};
