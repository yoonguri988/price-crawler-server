/**
 * @return /danawa 다나와 크롤링
 */
import { getBrowser } from "../utils/browser";

const generateId = () =>
  `product_danawa_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
const now = new Date().toISOString();

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

  await page.waitForSelector("div.main_prodlist", { timeout: 10000 });

  const data = await page.evaluate((now) => {
    const items = Array.from(document.querySelectorAll("div.prod_main_info"));

    return items.slice(0, 5).map((el, idx) => {
      const name = el.querySelector(".prod_name a")?.textContent?.trim() || "";
      const priceStr =
        el
          .querySelector(".price_sect strong")
          ?.textContent?.replace(/[^0-9]/g, "") || "0";
      const price = parseInt(priceStr, 10) || 0;

      const originalPrice = price + Math.floor(Math.random() * 50000); // 가짜 할인 처리
      const imageUrl =
        el
          .closest(".prod_main_info")
          ?.querySelector("img")
          ?.getAttribute("data-original") || "";
      const seller =
        el.querySelector(".prod_sub_info a.mall_name")?.textContent?.trim() ||
        "다나와 공식몰";
      const shippingInfo =
        el.querySelector(".prod_sub_info .prod_dlv")?.textContent?.trim() ||
        "무료배송";

      const reviewText =
        el.querySelector(".prod_otherinfo .cnt_opinion")?.textContent || "0";
      const reviewCount = parseInt(reviewText.replace(/[^0-9]/g, ""), 10) || 0;

      const badges = Array.from(
        el.querySelectorAll(".prod_otherinfo .icon_prod")
      ).map((bEl) => ({
        text: bEl.getAttribute("alt") || "",
        color: "#795548", // 공통 배지 색
      }));

      return {
        id: `product_danawa_${Date.now()}_${idx}`,
        category: "electronics",
        name,
        price,
        originalPrice,
        imageUrl,
        seller,
        reviewCount,
        shippingInfo,
        isSoldOut: false,
        isFavoite: false,
        rating: 0.0,
        createdAt: now,
        updatedAt: now,
        badges,
      };
    });
  }, now);

  await browser.close();
  return data;
};
