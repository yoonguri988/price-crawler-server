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
  const encodedQuery = encodeURIComponent(query);
  const url = `https://browse.gmarket.co.kr/search?keyword=${encodedQuery}`;

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

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });

    try {
      await page.waitForSelector("div.box__component-itemcard", {
        timeout: 15000,
      });
    } catch (e) {
      throw new Error(
        "G마켓: 상품 리스트 영역 로딩 실패 (div.box__component-itemcard)"
      );
    }

    // 스크롤 및 렌더링 시간 확보
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((res) => setTimeout(res, 3000));

    // await page.screenshot({
    //   path: "./screenshots/gmarket_debug.png",
    //   fullPage: true,
    // });

    // HTML 저장
    // const html = await page.content();
    // await fs.writeFile("./screenshots/gmarket_debug.html", html, "utf-8");
    // console.log("✅ HTML 및 스크린샷 저장 완료");

    // 상품 정보 추출 - 셀렉터 분석 및 데이터 파싱
    const data: ProductData[] = await page.$$eval(
      "div.box__component-itemcard",
      (items) => {
        return Array.from(items).map((el, idx) => {
          const numericId =
            el
              .querySelector("a.link__item")
              ?.getAttribute("data-montelena-goodscode") || idx; // id 없을 경우 uuid로 fallback
          const id = `product_gmarket_${numericId}`;
          const name =
            el.querySelector("span.text__item")?.textContent?.trim() || "";

          const imgEl = el.querySelector("div.image__image img");
          const imageUrl =
            imgEl?.getAttribute("data-original") ||
            imgEl?.getAttribute("src") ||
            "";

          const priceText =
            el
              .querySelector("strong.text__value")
              ?.textContent?.replace(/[^0-9]/g, "") || "0";
          const price = parseInt(priceText, 10);

          const originText =
            el
              .querySelector("div.box__price-original span.text__value")
              ?.textContent?.replace(/[^0-9]/g, "") || "0";
          const originalPrice = originText
            ? parseInt(originText, 10)
            : parseInt(priceText, 10);

          const seller =
            el.querySelector("span.text__brand-seller")?.textContent?.trim() ||
            "";

          const reviewCountText =
            el
              .querySelector("span.text__review > span.text__count")
              ?.textContent?.replace(/[^0-9]/g, "") || "0";

          const shippingInfo =
            Array.from(
              el.querySelectorAll("ul.list__tags li.list-item__tag .text__tag")
            )
              .map((tag) => tag.textContent?.trim() || "")
              .find((text) => text.includes("배송비")) || "";

          // badges (오늘출발, 무료배송 등)
          const badgeSpans = el.querySelectorAll(
            "ul.list__tags li.list-item__tag .text__tag"
          );

          const badges = [
            // span.text__tag 기반 배지 (텍스트형)
            ...Array.from(el.querySelectorAll("span.text__tag"))
              .map((span) => {
                const text = span.textContent?.trim() || "";
                const color =
                  span
                    .getAttribute("style")
                    ?.match(/color:\s*(#[0-9A-Fa-f]{6})/)?.[1] || "";
                return text && !text.includes("배송비")
                  ? { text, color }
                  : null;
              })
              .filter((b): b is { text: string; color: string } => b !== null),

            // img.alt 기반 배지 (무료배송 등 이미지형)
            ...Array.from(el.querySelectorAll("span.text__tag img"))
              .map((img) => {
                const text = img.getAttribute("alt") || "";
                return text ? { text, color: "" } : null;
              })
              .filter((b): b is { text: string; color: string } => b !== null),
          ];

          return {
            id,
            name,
            price,
            originalPrice,
            imageUrl,
            seller,
            reviewCount: parseInt(reviewCountText, 10),
            shippingInfo,
            badges,
          };
        });
      }
    );

    return data;
  } catch (err: any) {
    console.error(`[Gmarket] 크롤링 오류: ${err.message}`);
    throw new Error(`[Gmarket] 크롤링 실패 (${query}): ${err.message}`);
  } finally {
    await browser.close();
  }
};
