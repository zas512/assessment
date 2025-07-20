const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

let statsCache = null;
let lastModified = null;

function calculateStats(items) {
  return {
    total: items.length,
    averagePrice:
      items.length > 0
        ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
        : 0,
    categories: items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}),
    priceRange:
      items.length > 0
        ? {
            min: Math.min(...items.map((item) => item.price)),
            max: Math.max(...items.map((item) => item.price)),
          }
        : { min: 0, max: 0 },
  };
}

router.get("/", async (req, res, next) => {
  try {
    const stats = await fs.stat(DATA_PATH);
    const currentModified = stats.mtime.getTime();
    if (statsCache && lastModified === currentModified) {
      return res.json(statsCache);
    }
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const items = JSON.parse(raw);
    statsCache = calculateStats(items);
    lastModified = currentModified;
    res.json(statsCache);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
