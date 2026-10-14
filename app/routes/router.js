const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");

router.get("/", (req, res) => {
  res.render("pages/contato", { errors: [], values: {} });
});

router.post("/contato", [
  body("nome").trim().notEmpty().withMessage("Informe seu nome."),
  body("email").trim().isEmail().withMessage("Informe um e-mail válido."),
  body("telefone").trim().notEmpty().withMessage("Informe seu telefone."),
  body("assunto").trim().notEmpty().withMessage("Informe o assunto."),
  body("mensagem").trim().notEmpty().withMessage("Escreva uma mensagem."),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("pages/contato", { errors: errors.array(), values: req.body });
  }

  const { nome, email, telefone, assunto, mensagem } = req.body;
  const required = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS", "EMAIL_TO"];
  const missing = required.filter((key) => {
    const value = process.env[key]?.trim();
    return !value || /COLOQUE_AQUI|seu-email/i.test(value);
  });
  const mailPort = Number(process.env.EMAIL_PORT);
  if (!Number.isInteger(mailPort) || mailPort < 1 || mailPort > 65535) missing.push("EMAIL_PORT");
  if (missing.length) {
    return res.status(503).render("pages/contato", {
      errors: [{ msg: "Configure o arquivo .env (não o .env.example), preencha os dados SMTP e reinicie o servidor." }], values: req.body,
    });
  }

  try {
    const port = mailPort;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `Formulário de contato <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Contato: ${assunto}`,
      text: `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\nAssunto: ${assunto}\n\nMensagem:\n${mensagem}`,
    });
    return res.render("pages/sucesso", { nome });
  } catch (error) {
    console.error("Falha ao enviar mensagem de contato:", error.message);
    return res.status(502).render("pages/contato", {
      errors: [{ msg: "Não foi possível enviar sua mensagem agora. Tente novamente." }], values: req.body,
    });
  }
});

module.exports = router;
