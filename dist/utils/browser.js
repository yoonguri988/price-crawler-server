"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDanawaPrice = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteer_1 = __importDefault(require("puppeteer"));
dotenv_1.default.config();
const getDanawaPrice = async (query) => {
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
        await page.goto(`https://search.danawa.com/dsearch.php?keyword=${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });
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
    }
    catch (err) {
        console.error("크롤링 실패:", err);
        throw err;
    }
    finally {
        await browser.close();
    }
};
exports.getDanawaPrice = getDanawaPrice;
