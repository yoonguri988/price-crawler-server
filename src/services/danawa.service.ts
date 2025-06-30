/**
 * @return /danawa 다나와 크롤링
 */
import { getBrowser } from "../utils/browser";
import { ProductData } from "../types/product.type";

export const getDanawaProducts = async (
  query: string
): Promise<ProductData[]> => {
  const browser = await getBrowser();
  const encodedQuery = encodeURIComponent(query);
  const url = `https://search.danawa.com/dsearch.php?query=${encodedQuery}`;

  try {
    const page = await browser.newPage();

    // 봇 탐지 회피 설정
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114"
    );
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "ko-KR,ko;q=0.9",
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    try {
      await page.waitForSelector("ul.product_list", { timeout: 15000 });
    } catch (e) {
      throw new Error("다나와: 상품 리스트 영역 로딩 실패 (ul.product_list)");
    }

    // 스크롤 및 렌더링 시간 확보
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((res) => setTimeout(res, 2000));

    // 상품 정보 추출
    const data: ProductData[] = await page.$$eval("li.prod_item", (nodes) =>
      nodes.slice(0, 5).map((el, idx) => {
        const productIdx = el.getAttribute("id")?.indexOf("productItem") || 0;
        const productNum = el.getAttribute("id")?.slice(productIdx + 11);
        const id = `product_danawa_${productNum}`;

        const priceText =
          el
            .querySelector(`#min_price_${productNum}`)
            ?.textContent?.replace(/[^0-9]/g, "") || "0";
        const price = parseInt(priceText, 10);
        const originalPrice = price;

        let imageUrl =
          el.querySelector(".thumb_image img")?.getAttribute("src") ?? "";
        const seller = "다나와";

        const name = el.querySelector(".prod_name")?.textContent?.trim() ?? "";
        const reviewCountText =
          el
            .querySelector(
              ".prod_sub_info .prod_sub_meta .star-single .text__review .text__number"
            )
            ?.textContent?.replace(/[^0-9]/g, "") || "0";
        const reviewCount = parseInt(reviewCountText);
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
          //badges,
        };
      })
    );

    return data;
  } catch (err: any) {
    console.error(`[danawa] 크롤링 오류: ${err.message}`);
    throw new Error(`[danawa] 크롤링 실패 (${query}): ${err.message}`);
  } finally {
    await browser.close();
  }
};
