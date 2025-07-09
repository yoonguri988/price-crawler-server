/**
 * @return /enuri 크롤링
 *
 * @todo
 * #1 셀렉터 분석 후 아래 로직 구현
 */
import { getBrowser } from "../utils/browser";
import { ProductData } from "../types/product.type";

export const getEnuriProducts = async (
  query: string
): Promise<ProductData[]> => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.enuri.com/search.jsp?keyword=${encodedQuery}`;

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
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      // 실제 리다이렉트된 URL 확인 및 재접근
      const redirectedUrl = page.url();
      await page.goto(redirectedUrl, {
        waitUntil: "networkidle2",
        timeout: 20000,
      });
    } catch (gotoErr) {
      console.error("[ENURI][ERROR] 페이지 이동 실패:", gotoErr);
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

      const hasListCont = await page.$(".goods-list");
      if (!hasListCont) {
        console.warn("[ENURI][WARN] .goods-list 요소가 탐색되지 않음");
        // await page.screenshot({
        //   path: "enuri_no_goodsList.png",
        //   fullPage: true,
        // });
        return [];
      }
      await page.waitForSelector(".goods-list", { timeout: 10000 });
    } catch (selectorErr) {
      console.error("[ENURI][ERROR] Selector 로딩 실패:", selectorErr);
      return [];
    }

    // 사용자 기준 데이터 추출 로직 유지, ProductData에 맞게 정제
    const data: ProductData[] = await page.$$eval(
      ".goods-bundle > li.prodItem",
      (nodes) => {
        return nodes.map((el, idx) => {
          const id = `product_enuri_${
            el.getAttribute("data-model-origin") || idx
          }`;
          /* 카테고리 */
          // const category = el.getAttribute("data-cate2-nm") || "";
          /* 이름 */
          const name =
            el.querySelector(".item__thumb a img")?.getAttribute("alt") ?? "";
          /* 이미지 주소 */
          const imageUrl =
            el.querySelector(".item__thumb a img")?.getAttribute("src") ?? "";

          /* 가격 TEXT */
          const priceText =
            el
              .querySelector(".price__option li.option__row span.tx--price")
              ?.textContent?.replace(/[^0-9]/g, "") ?? "0";
          /* 가격 */
          const price = parseInt(priceText, 10);
          /* 할인 전 가격 */
          const originalPrice = price;

          /* 파는 곳 */
          const seller = "에누리";
          /* 리뷰 개수 */
          const reviewCountText =
            el
              .querySelector("ul.item__etc li.item__etc--score a")
              ?.textContent?.replace(/[^0-9]/g, "") ?? "0";
          const reviewCount = parseInt(reviewCountText, 10);

          /* 쇼핑 정보 */
          const shippingInfo =
            el.querySelector(".price__delivery a")?.textContent?.trim() ?? "";

          /* 뱃지 */
          const badgeSpans = el.querySelectorAll(
            ".item__cont .special-price dl dt"
          );
          const badges = Array.from(badgeSpans)
            .map((b) => b.textContent?.trim())
            .filter((text): text is string => !!text)
            .map((text) => ({ text, color: "" }));

          return {
            id,
            name,
            imageUrl,
            price,
            originalPrice,
            seller,
            reviewCount,
            shippingInfo,
            badges,
          };
        });
      }
    );

    //⚠️ 크롤링 결과 로깅
    if (data.length === 0) {
      console.warn(`[ENURI] '${query}' 결과 없음`);
    } else {
      console.log(`[ENURI] '${query}' 결과 ${data.length}건 수집됨`);
    }

    return data;
  } catch (err: any) {
    console.error(`[ENURI][ERROR] 예기치 못한 오류: ${err.message}`);
    return [];
  } finally {
    await browser.close();
  }
};
