// backend/src/server.js
// Local dev entry — runs the Express app on PORT (default 3001).
import { buildApp } from "./app.js";

const app = buildApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
