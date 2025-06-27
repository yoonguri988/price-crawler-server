/**
 * @return /danawa 다나와 크롤링
 */
import { getBrowser } from "../utils/browser";

export const crawlDanawa = async (query: string) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114"
  );

  const searchUrl = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(
    query
  )}`;
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

  // 실제 상품 리스트 로딩 기다리기
  await page.waitForSelector("div.main_prodlist", { timeout: 10000 });

  const result = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("div.prod_main_info"));
    return items.slice(0, 5).map((el) => {
      const title = el.querySelector(".prod_name a")?.textContent?.trim();
      const price = el.querySelector(".price_sect strong")?.textContent?.trim();
      return { title, price };
    });
  });

  await browser.close();
  return result;
};
