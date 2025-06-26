import dotenv from "dotenv";
dotenv.config();
import puppeteer from "puppeteer";
import fs from "fs";

const isRender = process.env.RENDER === "true";
const renderChromePath =
  "/opt/render/.cache/puppeteer/chrome/linux-137.0.7151.119/chrome-linux64/chrome";

const getBrowser = async () => {
  console.log("▶ Render mode:", isRender);
  console.log("▶ Chrome path:", renderChromePath);
  console.log("▶ Exists:", fs.existsSync(renderChromePath));
  console.log("▶ Process UID:", process.getuid?.());

  const executablePath =
    isRender && fs.existsSync(renderChromePath)
      ? renderChromePath
      : puppeteer.executablePath();

  console.log("▶ Puppeteer ExecutablePath:", puppeteer.executablePath());
  console.log(
    "▶ Chrome file mode:",
    fs.statSync(renderChromePath).mode.toString(8)
  );

  return await puppeteer.launch({
    headless: true,
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

    return data;
  } catch (err) {
    console.error("❌ getDanawaPrice 내부 오류:", err);
    throw err;
  } finally {
    await browser.close();
  }
};
