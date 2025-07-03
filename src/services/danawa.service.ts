/**
 * @return /danawa 다나와 크롤링
 */
import { getBrowser } from "../utils/browser";
import { ProductData } from "../types/product.type";

export const getDanawaProducts = async (
  query: string
): Promise<ProductData[]> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    //⚠️ goto 실패 대응
    try {
      await page.goto(
        `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(
          query
        )}`,
        {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        }
      );
    } catch (gotoErr) {
      console.log(`[DANAWA][ERROR] 페이지 이동 실패:`, gotoErr);
      return [];
    }

    // ⚠️ waitForSelector 실패 대응
    try {
      await page.waitForSelector("ul.product_list", { timeout: 15000 });
    } catch (selectorErr) {
      console.log("[DANAWA][ERROR] Selector 로딩 실패:", selectorErr);
      return [];
    }

    // 상품 정보 추출
    const products = await page.evaluate(() => {
      const items = document.querySelectorAll(
        "div.main_prodlist.main_prodlist_list > ul > li.prod_item.prod_layer"
      );
      const results: any[] = [];

      items.forEach((item) => {
        const name =
          item.querySelector("p.prod_name > a")?.textContent?.trim() || "";
        const priceText =
          item
            .querySelector("p.price_sect > a")
            ?.textContent?.replace(/[^0-9]/g, "") || "0";
        const price = parseInt(priceText, 10);
        const imageUrl =
          item
            .querySelector("a.thumb_link > img")
            ?.getAttribute("data-original") || "";
        const seller =
          item
            .querySelector(
              "div.prod_sub_info > p.prod_sub_meta > span.meta_item > a"
            )
            ?.textContent?.trim() || "";

        results.push({
          id: crypto.randomUUID(),
          category: "",
          name,
          price,
          originalPrice: price,
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
      console.warn(`[DANAWA] '${query}' 결과 없음`);
    } else {
      console.log(`[DANAWA] '${query}' 결과 ${products.length}건 수집됨`);
    }

    return products;
  } catch (error) {
    console.error("[DANAWA][ERROR] 예기치 못한 오류:", error);
    return [];
  } finally {
    await browser.close();
  }
};
