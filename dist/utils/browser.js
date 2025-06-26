"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDanawaPrice = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
dotenv_1.default.config();
const getDanawaPrice = async (query) => {
    const executablePath = process.env.CHROME_PATH;
    if (!executablePath)
        throw new Error("CHROME_PATH env var not set!");
    const browser = await puppeteer_core_1.default.launch({
        executablePath: executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(`https://search.danawa.com/dsearch.php?keyword=${encodeURIComponent(query)}`, {
        waitUntil: "domcontentloaded",
    });
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
exports.getDanawaPrice = getDanawaPrice;
