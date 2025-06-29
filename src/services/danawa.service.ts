/**
 * @return /danawa 다나와 크롤링
 */
import { getBrowser } from "../utils/browser";

const generateId = () =>
  `product_danawa_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
const now = new Date().toISOString();

export const getDanawaProducts = async (query: string) => {
  const browser = await getBrowser();

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

    const searchUrl = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(
      query
    )}`;
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 20000 });

    try {
      await page.waitForSelector("ul.product_list", { timeout: 15000 });
    } catch (e) {
      throw new Error("다나와: 상품 리스트 영역 로딩 실패 (ul.product_list)");
    }

    // 스크롤 및 렌더링 시간 확보
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((res) => setTimeout(res, 2000));

    // 상품 정보 추출
    const data = await page.$$eval("li.prod_item", (nodes) =>
      nodes.slice(0, 5).map((el, idx) => {
        const productIdx = el.getAttribute("id")?.indexOf("productItem") || 0;
        const productNum = el.getAttribute("id")?.slice(productIdx + 11);
        const id = `crawl_danawa_${productNum}`;

        const elCate = el.querySelector(
          `#productItem_categoryInfo_${productNum}`
        );
        const category =
          elCate && elCate instanceof HTMLInputElement ? elCate.value : "";
        const elPrice = el.querySelector(`#min_price_${productNum}`);
        const price =
          elPrice && elPrice instanceof HTMLInputElement ? elPrice.value : "";

        // .product_main_info
        // ├ .thumb_image
        let imageUrl =
          el.querySelector(".thumb_image img")?.getAttribute("src") ?? "";
        // ├ .prod_info
        const name = el.querySelector(".prod_name")?.textContent?.trim() ?? "";
        // └ .prod_pricelist
        //   └ .prod_sub_info
        //     └ .prod_sub_meta
        //       └ .meta_item .mt_comment
        //       └ .star-single .text__score
        //       └ .star-single .text__review .text__number
        const rating = el.querySelector(
          `.prod_sub_info .prod_sub_meta .star-single .text__score`
        )?.textContent;
        const reviewCount = el.querySelector(
          ".prod_sub_info .prod_sub_meta .star-single .text__review .text__number"
        )?.textContent;

        return {
          id,
          category,
          name,
          price,
          imageUrl,
          // seller = "다나와 공식몰",
          rating,
          reviewCount,
          // badges = [{}],
          // createdAt: creNow,
        };
      })
    );

    return data;
  } catch (err: any) {
    console.error(`[danawa] 크롤링 오류: ${err.message}`);
    // 어떤 검색어에서 실패했는지 추적
    throw new Error(`[danawa] 크롤링 실패 (${query}): ${err.message}`);
  } finally {
    await browser.close();
  }
};
