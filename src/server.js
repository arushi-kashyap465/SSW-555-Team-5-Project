import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import configRoutes from "./routes/index.js";

const app = express();
const port = 3000;

// Needed because __dirname doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handlebars setup
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

configRoutes(app);

app.get("/", (req, res) => {
  res.render("home", {
    title: "QR Attendance System",
    message: "Welcome to the QR Attendance Web App!"
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});