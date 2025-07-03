/**
 * @return /gmarket 크롤링
 *
 * @todo
 * #1 셀렉터 분석 후 아래 로직 구현
 */
import { getBrowser } from "../utils/browser";
import fs from "fs/promises"; // HTML 저장용
import { ProductData } from "../types/product.type";

export const getGmarketProducts = async (
  query: string
): Promise<ProductData[]> => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const encodedQuery = encodeURIComponent(query);
  const url = `https://browse.gmarket.co.kr/search?keyword=${encodedQuery}`;

  try {
    //⚠️ goto 실패 대응
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
    } catch (gotoErr) {
      console.log(`[GMARKET][ERROR] 페이지 이동 실패:`, gotoErr);
      return [];
    }
    // ⚠️ waitForSelector 실패 대응
    try {
      await page.waitForSelector("div.box__component-itemcard", {
        timeout: 15000,
      });
    } catch (selectorErr) {
      console.log("[DANAWA][ERROR] Selector 로딩 실패:", selectorErr);
      return [];
    }

    // 상품 정보 추출 - 셀렉터 분석 및 데이터 파싱
    const products = await page.evaluate(() => {
      const items = document.querySelectorAll(`div.box__component-itemcard`);

      const results: any[] = [];

      items.forEach((item) => {
        const numericId =
          item
            .querySelector("a.link__item")
            ?.getAttribute("data-montelena-goodscode") || ""; // id 없을 경우 uuid로 fallback
        const id = `product_gmarket_${numericId}`;
        const name =
          item.querySelector("span.text__item")?.textContent?.trim() || "";

        const imgEl = item.querySelector("div.image__image img");
        const imageUrl =
          imgEl?.getAttribute("data-original") ||
          imgEl?.getAttribute("src") ||
          "";

        const priceText =
          item
            .querySelector("strong.text__value")
            ?.textContent?.replace(/[^0-9]/g, "") || "0";
        const price = parseInt(priceText, 10);

        const originText =
          item
            .querySelector("div.box__price-original span.text__value")
            ?.textContent?.replace(/[^0-9]/g, "") || "0";
        const originalPrice = originText
          ? parseInt(originText, 10)
          : parseInt(priceText, 10);

        const seller =
          item.querySelector("span.text__brand-seller")?.textContent?.trim() ||
          "";

        const reviewCountText =
          item
            .querySelector("span.text__review > span.text__count")
            ?.textContent?.replace(/[^0-9]/g, "") || "0";

        const shippingInfo =
          Array.from(
            item.querySelectorAll("ul.list__tags li.list-item__tag .text__tag")
          )
            .map((tag) => tag.textContent?.trim() || "")
            .find((text) => text.includes("배송비")) || "";

        // badges (오늘출발, 무료배송 등)
        const badgeSpans = item.querySelectorAll(
          "ul.list__tags li.list-item__tag .text__tag"
        );

        const badges = [
          // span.text__tag 기반 배지 (텍스트형)
          ...Array.from(item.querySelectorAll("span.text__tag"))
            .map((span) => {
              const text = span.textContent?.trim() || "";
              const color =
                span
                  .getAttribute("style")
                  ?.match(/color:\s*(#[0-9A-Fa-f]{6})/)?.[1] || "";
              return text && !text.includes("배송비") ? { text, color } : null;
            })
            .filter((b): b is { text: string; color: string } => b !== null),

          // img.alt 기반 배지 (무료배송 등 이미지형)
          ...Array.from(item.querySelectorAll("span.text__tag img"))
            .map((img) => {
              const text = img.getAttribute("alt") || "";
              return text ? { text, color: "" } : null;
            })
            .filter((b): b is { text: string; color: string } => b !== null),
        ];

        results.push({
          id,
          name,
          price,
          originalPrice,
          imageUrl,
          seller,
          reviewCount: 0,
          shippingInfo: "",
          badges: [],
        });
      });

      return results;
    });

    //⚠️ 크롤링 결과 로깅
    if (products.length === 0) {
      console.warn(`[GMARKET] '${query}' 결과 없음`);
    } else {
      console.log(`[GMARKET] '${query}' 결과 ${products.length}건 수집됨`);
    }

    return products;
  } catch (err: any) {
    console.error(`[Gmarket] 크롤링 오류: ${err.message}`);
    throw new Error(`[Gmarket] 크롤링 실패 (${query}): ${err.message}`);
  } finally {
    await browser.close();
  }
};
