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

    // ⚠️ waitForSelector 실패 대응
    try {
      await page.waitForSelector("li.prodItem[data-type='model']", {
        timeout: 10000,
      });
    } catch (selectorErr) {
      console.error("[ENURI][ERROR] Selector 로딩 실패:", selectorErr);
      return [];
    }

    // 상품 정보 추출
    const products: ProductData[] = await page.evaluate(() => {
      const items = document.querySelectorAll(".listCont ul li:not(.adli)");

      return Array.from(items).map((el, idx) => {
        const id = `product_enuri_${idx}`;
        const name = el.querySelector(".tit")?.textContent?.trim() ?? "";
        const priceText =
          el
            .querySelector(".price span")
            ?.textContent?.replace(/[^0-9]/g, "") ?? "0";
        const price = parseInt(priceText, 10);
        const originalPrice = price;
        const imageUrl =
          el.querySelector(".thumb img")?.getAttribute("src") ?? "";
        const seller = "에누리";
        const reviewCount = 0;

        const shippingInfo =
          el.querySelector(".tag--today-depart i")?.textContent?.trim() ?? "";

        const badgeSpans = el.querySelectorAll("span.ico");
        const badges = Array.from(badgeSpans)
          .map((b) => b.textContent?.trim())
          .filter((text): text is string => !!text)
          .map((text) => ({ text, color: "" }));

        return {
          id,
          name,
          price,
          originalPrice: price,
          imageUrl,
          seller,
          reviewCount: 0,
          shippingInfo: "",
          badges,
        };
      });
    });

    //⚠️ 크롤링 결과 로깅
    if (products.length === 0) {
      console.warn(`[ENURI] '${query}' 결과 없음`);
    } else {
      console.log(`[ENURI] '${query}' 결과 ${products.length}건 수집됨`);
    }

    return products;
  } catch (err: any) {
    console.error(`[ENURI][ERROR] 예기치 못한 오류: ${err.message}`);
    return [];
  } finally {
    await browser.close();
  }
};
