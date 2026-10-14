const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const app = express();
const porta = Number(process.env.PORT) || 3000;

app.use(express.static(path.join(__dirname, "app/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rota = require("./app/routes/router");
app.use("/", rota);

const mailSettings = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS", "EMAIL_TO"];
const missingMailSettings = mailSettings.filter((key) => {
  const value = process.env[key]?.trim();
  return !value || /COLOQUE_AQUI|seu-email/i.test(value);
});
if (missingMailSettings.length) {
  console.warn("E-mail não configurado. Crie o arquivo .env a partir do .env.example e preencha as configurações.");
}

app.listen(porta, () => {
  console.log(`Servidor on-line: http://localhost:${porta}`);
});
