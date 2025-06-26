"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const browser_1 = require("../utils/browser");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Missing query" });
    }
    try {
        const result = await (0, browser_1.getDanawaPrice)(query);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to crawl",
            detail: err.message,
            stack: err.stack,
        });
    }
});
exports.default = router;
