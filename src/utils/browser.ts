import puppeteer from "puppeteer";

const isRender = process.env.RENDER === "true";

export const getBrowser = async () => {
  // Puppeteer가 설치한 크롬 경로 명시
  const executablePath = puppeteer.executablePath();
  return await puppeteer.launch({
    headless: true,
    executablePath, // ✅ 명시적으로 경로 설정
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};

export const getDanawaPrice = async (query: string) => {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "ko-KR,ko;q=0.9",
    });

    await page.goto(
      `https://search.danawa.com/dsearch.php?keyword=${encodeURIComponent(
        query
      )}`,
      {
        waitUntil: "domcontentloaded",
      }
    );
    await page.setJavaScriptEnabled(true);
    // await page.waitForSelector(".prod_main_info", { timeout: 5000 }); // ← 중요

    const html = await page.content();
    console.log(
      "▶ HTML에 prod_main_info 포함 여부:",
      html.includes("prod_main_info")
    );

    const data = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".prod_main_info"));
      return items.slice(0, 5).map((el) => {
        const title =
          el.querySelector(".prod_name")?.textContent?.trim() || "no title";
        const price =
          el.querySelector(".price_sect a strong")?.textContent?.trim() ||
          "no price";
        return { title, price };
      });
    });

    console.log("▶ 크롤링된 상품 개수:", data.length);

    return data;
  } catch (err) {
    console.error("❌ getDanawaPrice 내부 오류:", err);
    throw err;
  } finally {
    await browser.close();
  }
};
