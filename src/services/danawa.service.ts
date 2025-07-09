/**
 * @return /danawa 다나와 크롤링
 */
import { getBrowser } from "../utils/browser";
import { ProductData } from "../types/product.type";
import fs from "fs";
import path from "path";

export const getDanawaProducts = async (
  query: string
): Promise<ProductData[]> => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const encodedQuery = encodeURIComponent(query);
  const url = `https://search.danawa.com/dsearch.php?query=${encodedQuery}`;

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
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    } catch (gotoErr) {
      console.log(`[DANAWA][ERROR] 페이지 이동 실패:`, gotoErr);
      return [];
    }

    try {
      /**
       * DEBUG 용 HTML 파일 생성
       *
       * const debugHtml = await page.content();
       * const fs = await import("fs/promises");
       * await fs.writeFile("./htmls/[crawler]_debug.html", debugHtml);
       *
       * console.log("[ENURI][DEBUG] HTML saved to [crawler]_debug.html");
       */

      const hasListCont = await page.$(".main_prodlist");
      if (!hasListCont) {
        console.warn("[ENURI][WARN] .main_prodlist 요소가 탐색되지 않음");
        // await page.screenshot({
        //   path: "./screenshot/danawa_no_[main_prodlist].png",
        //   fullPage: true,
        // });
        return [];
      }

      // ⚠️ waitForSelector 실패 대응
      await page.waitForSelector(".main_prodlist", {
        timeout: 15000,
      });
    } catch (selectorErr) {
      console.log("[DANAWA][ERROR] Selector 로딩 실패:", selectorErr);
      return [];
    }

    // 사용자 기준 데이터 추출 로직 유지, ProductData에 맞게 정제
    const data: ProductData[] = await page.$$eval(
      "ul.product_list li.prod_item",
      (nodes) => {
        return nodes
          .filter((el) => el.getAttribute("id")?.includes("productItem"))
          .map((el, idx) => {
            const itemNum =
              el.getAttribute("id")?.replace(/[^0-9]/g, "") ?? idx;
            /* ID */
            const id = `product_danawa_${itemNum}`;
            /* 이름 */
            const name =
              el.querySelector(".prod_info .prod_name a")?.textContent ?? "";
            /* 이미지 주소 */
            const imageUrl =
              el.querySelector(`.thumb_image a img`)?.getAttribute("src") ?? "";
            /* 가격 */
            const priceText =
              el
                .querySelector(`input[id='min_price_${itemNum}']`)
                ?.getAttribute("value")
                ?.replace(/[^0-9]/g, "") ?? "0";
            const price = parseInt(priceText, 10);
            /* 할인 전 가격 */
            const originalPrice = price;
            /* 파는 곳 */
            const seller = "danawa";
            /* 리뷰 개수 */
            const reviewText =
              el
                .querySelector(".text__review span.text__number")
                ?.textContent?.replace(/[^0-9]/g, "") ?? "0";
            const reviewCount = parseInt(reviewText, 10);
            /* 쇼핑 정보 */
            const shippingInfo = "";

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
      console.warn(`[DANAWA] '${query}' 결과 없음`);
    } else {
      console.log(`[DANAWA] '${query}' 결과 ${data.length}건 수집됨`);
    }

    return data;
  } catch (error) {
    console.error("[DANAWA][ERROR] 예기치 못한 오류:", error);
    return [];
  } finally {
    await browser.close();
  }
};
