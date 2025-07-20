const express = require("express");
const cors = require("cors");
const itemsRouter = require("./routes/items");
const statsRouter = require("./routes/stats");

const app = express();
const PORT = 4001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/api/items", itemsRouter);
app.use("/api/stats", statsRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
