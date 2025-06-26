import puppeteer from "puppeteer";

export const getDanawaPrice = async (query: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(
    `https://search.danawa.com/dsearch.php?keyword=${encodeURIComponent(
      query
    )}`,
    {
      waitUntil: "domcontentloaded",
    }
  );

  const data = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll(".prod_main_info"));
    return items.slice(0, 5).map((el) => {
      const title = el.querySelector(".prod_name")?.textContent?.trim();
      const price = el
        .querySelector(".price_sect a strong")
        ?.textContent?.trim();
      return { title, price };
    });
  });

  await browser.close();
  return data;
};
