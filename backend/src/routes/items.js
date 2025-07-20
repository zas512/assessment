const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

async function readData() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

router.get("/", async (req, res, next) => {
  try {
    const { limit = 10, page = 1, q } = req.query;
    const data = await readData();
    let results = data;
    if (q) {
      const searchTerm = q.toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
      );
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedResults = results.slice(startIndex, endIndex);
    res.json({
      items: paginatedResults,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(results.length / limitNum),
        totalItems: results.length,
        itemsPerPage: limitNum,
        hasNextPage: endIndex < results.length,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await readData();
    const item = data.find((i) => i.id === parseInt(id));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, category, price } = req.body;
    if (!name || !category || typeof price !== "number") {
      const err = new Error("Invalid item data");
      err.status = 400;
      throw err;
    }
    const data = await readData();
    const newItem = {
      id: Date.now(),
      name,
      category,
      price,
    };
    data.push(newItem);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
