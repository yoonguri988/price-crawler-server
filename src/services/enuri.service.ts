import { getBrowser } from "../utils/browser";

export const getEnuriProducts = async (query: string) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // 봇 탐지 회피 설정
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "ko-KR,ko;q=0.9",
    });

    // 검색 페이지 접속
    const searchUrl = `https://www.enuri.com/search.jsp?keyword=${encodeURIComponent(
      query
    )}`;
    await page.goto(searchUrl, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    // 실제 리다이렉트된 URL 확인 및 재접근
    const redirectedUrl = page.url();
    await page.goto(redirectedUrl, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    // 스크롤 및 렌더링 시간 확보
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((res) => setTimeout(res, 2000));

    // 스크린샷 파일 확인 (Debug)
    // await page.screenshot({ path: "enuri_debug.png", fullPage: true });

    // 최소 렌더링 확인
    await page.waitForFunction(
      () => {
        return !!document.querySelector("li.prodItem[data-type='model']");
      },
      { timeout: 15000 }
    );

    // 상품 정보 추출
    const rawItems = await page.$$eval(
      "li.prodItem[data-type='model']",
      (nodes) =>
        nodes.slice(0, 10).map((el, idx) => {
          const id = el.getAttribute("data-id") ?? `enuri_${idx}`;

          const name =
            el.querySelector('a[data-type="modelname"]')?.textContent?.trim() ??
            "";

          let imageUrl =
            el.querySelector("div.item__thumb img")?.getAttribute("src") ?? "";
          if (imageUrl.startsWith("//")) imageUrl = `https:${imageUrl}`;

          const priceText =
            el
              .querySelector(".opt--price .tx--price")
              ?.textContent?.replace(/[^\d]/g, "") ?? "0";
          const price = parseInt(priceText, 10);

          const originalPrice = price; // 원래가 없음 → 동일 처리
          const seller =
            el.querySelector(".opt--count")?.textContent?.trim() ?? "";

          const reviewRaw =
            el.querySelector(".item__etc--score")?.textContent ?? "";
          const reviewCount = parseInt(
            reviewRaw.match(/\((\d+)\)/)?.[1] ?? "0"
          );

          const ratingStyle =
            el.querySelector(".ico-etc-star--score")?.getAttribute("style") ??
            "width:0%";
          const ratingPercent =
            parseFloat(ratingStyle.replace(/[^\d.]/g, "")) || 0;
          const rating = Math.round((ratingPercent / 100) * 5 * 10) / 10; // 소수점 1자리

          const shippingInfo =
            el.querySelector(".tag--today-depart i")?.textContent?.trim() ?? "";

          const badgeNodes = el.querySelectorAll("span.ico");
          const badges = Array.from(badgeNodes)
            .map((b) => b.textContent?.trim())
            .filter(Boolean);

          return {
            name,
            price,
            originalPrice,
            imageUrl,
            seller,
            reviewCount,
            shippingInfo,
            rating,
            badges,
          };
        })
    );

    const now = new Date().toISOString();
    const data = rawItems.map((item, idx) => ({
      id: `product_enuri_${Date.now()}_${idx}`,
      // category: "electronics",
      ...item,
      isSoldOut: false,
      isFavoite: false,
      createdAt: now,
      updatedAt: now,
    }));

    return data;
  } catch (error) {
    console.error("🛑 Enuri 크롤링 실패:", error);
    throw new Error("에누리 크롤링 중 오류 발생");
  } finally {
    await page.close();
    await browser.close();
  }
};
