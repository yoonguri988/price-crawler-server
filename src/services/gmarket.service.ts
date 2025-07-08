/**
 * src/services/gmarket.service.ts
 * @return /gmarket 크롤링
 */
import { getBrowser } from "../utils/browser";
import { ProductData } from "../types/product.type";
import fs from "fs";
import path from "path";

export const getGmarketProducts = async (
  query: string
): Promise<ProductData[]> => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const encodedQuery = encodeURIComponent(query);
  const url = `https://browse.gmarket.co.kr/search?keyword=${encodedQuery}`;

  try {
    // User-Agent 설정: HeadlessChrome 탐지 우회를 위해 일반 브라우저 UA 사용
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114"
    );
    // Viewport 설정: 데스크톱 기반 뷰로 레이아웃 안정화
    await page.setViewport({ width: 1280, height: 800 });
    // HTTP 헤더 설정: 한글 페이지 노출 강제
    await page.setExtraHTTPHeaders({
      "Accept-Language": "ko-KR,ko;q=0.9",
    });

    //⚠️ goto 실패 대응
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
    } catch (gotoErr) {
      console.log(`[GMARKET][ERROR] 페이지 이동 실패:`, gotoErr);
      return [];
    }

    try {
      /**
       * DEBUG 용 HTML 파일 생성
       *
       * const debugHtml = await page.content();
       * const fs = await import("fs/promises");
       * await fs.writeFile("./htmls/enuri_debug.html", debugHtml);
       *
       * console.log("[ENURI][DEBUG] HTML saved to enuri_debug.html");
       */

      const hasListCont = await page.$(".section__module-wrap");
      if (!hasListCont) {
        console.warn(
          "[ENURI][WARN] .section__module-wrap 요소가 탐색되지 않음"
        );
        return [];
      }

      await page.screenshot({
        path: "./screenshot/gmarket_no_[section__module-wrap].png",
        fullPage: true,
      });

      // ⚠️ waitForSelector 실패 대응
      await page.waitForSelector("div.section__module-wrap", {
        timeout: 15000,
      });
    } catch (selectorErr) {
      console.log("[DANAWA][ERROR] Selector 로딩 실패:", selectorErr);
      return [];
    }

    // 사용자 기준 데이터 추출 로직 유지, ProductData에 맞게 정제
    const data: ProductData[] = await page.$$eval(
      ".box__component-itemcard--general > div.box__item-container",
      (nodes) => {
        return nodes.map((el, idx) => {
          const text = el.querySelector(".box__image");
          /* ID */
          const id = `product_gmarket_${
            text
              ?.querySelector("a")
              ?.getAttribute("data-montelena-goodscode") || idx
          }`;
          /* 이름 */
          const name = text?.querySelector("img")?.getAttribute("alt") ?? "";
          /* 이미지 주소 */
          const imageUrl =
            text?.querySelector("img")?.getAttribute("src") ?? "";

          const priceEl = el.querySelector(".box__item-price");
          /* 가격 */
          const priceText =
            priceEl
              ?.querySelector(".box__price-seller strong")
              ?.textContent?.replace(/[^0-9]/g, "") ?? "0";
          const price = parseInt(priceText, 10);

          /* 할인 전 가격 */
          const originalPriceText =
            priceEl
              ?.querySelector(".box__price-original span.text__value")
              ?.textContent?.replace(/[^0-9]/g, "") ?? "0";

          let originalPrice = parseInt(originalPriceText, 10);
          if (originalPrice === 0) originalPrice = price;

          /* 파는 곳 */
          const seller = "Gmarket";
          /* 리뷰 개수 */
          const reviewText =
            el
              .querySelector(".list-item__feedback-count span.text")
              ?.textContent?.replace(/[^0-9]/g, "") ?? "0";
          const reviewCount = parseInt(reviewText, 10);

          /* 쇼핑 정보 */
          const shippingTags = el.querySelectorAll(
            "div.box__item-arrival ul.list__tags li.list-item__tag"
          );
          const shippingInfo = Array.from(shippingTags)
            .filter((item) => !item.classList.contains("list-item__tag--today"))
            .map((span) => span.textContent?.trim() || "")
            .filter(Boolean)
            .join(" / ");

          return {
            id,
            name,
            price,
            originalPrice,
            imageUrl,
            seller,
            reviewCount,
            shippingInfo,
          };
        });
      }
    );

    //⚠️ 크롤링 결과 로깅
    if (data.length === 0) {
      console.warn(`[GMARKET] '${query}' 결과 없음`);
    } else {
      console.log(`[GMARKET] '${query}' 결과 ${data.length}건 수집됨`);
    }

    return data;
  } catch (err: any) {
    console.error(`[Gmarket] 크롤링 오류: ${err.message}`);
    throw new Error(`[Gmarket] 크롤링 실패 (${query}): ${err.message}`);
  } finally {
    await browser.close();
  }
};
