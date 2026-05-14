const nodemailer = require('nodemailer');

function hasSmtpConfig() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
}

function getSmtpPassword() {
  return (process.env.EMAIL_PASSWORD || '').replace(/\s/g, '');
}

function getTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: getSmtpPassword(),
    },
  });
}

function getBaseUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function buildResetLink(token) {
  return `${getBaseUrl()}/?token=${encodeURIComponent(token)}&type=reset`;
}

function getPasswordResetTemplate(userName, resetLink) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e5e5e5; background: #050505; }
    .container { max-width: 500px; margin: 0 auto; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; background: #0a0a0a; }
    .header { background: linear-gradient(135deg, #D4A017 0%, #b8860b 100%); color: #0A0A0A; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 30px 20px; }
    .content h2 { color: #D4A017; font-size: 20px; margin-top: 0; }
    .content p { color: #999; margin: 15px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #D4A017 0%, #b8860b 100%); color: #0A0A0A; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: bold; }
    .link-text { word-break: break-all; color: #D4A017; font-family: monospace; font-size: 12px; background: #111; padding: 10px; border-radius: 6px; border: 1px solid #1a1a1a; }
    .warning { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px; border-radius: 6px; color: #ef4444; font-size: 12px; margin-top: 15px; }
    .footer { background: #050505; padding: 15px 20px; text-align: center; font-size: 12px; color: #555; border-top: 1px solid #1a1a1a; }
    .highlight { color: #D4A017; font-weight: bold; }
  </style>
</head>
<body style="background: #050505; margin: 0; padding: 20px;">
  <div class="container">
    <div class="header">
      <h1>FinanceTrack</h1>
    </div>
    <div class="content">
      <h2>Recuperacao de Senha</h2>
      <p>Ola <span class="highlight">${userName}</span>,</p>
      <p>Recebemos uma solicitacao para redefinir sua senha.</p>
      <center>
        <a href="${resetLink}" class="button">Redefinir Senha</a>
      </center>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p class="link-text">${resetLink}</p>
      <p style="color: #666; font-size: 12px;">Este link expira em 1 hora.</p>
      <div class="warning">Se voce nao solicitou uma recuperacao de senha, ignore este e-mail.</div>
    </div>
    <div class="footer">
      <p style="margin: 0;">(c) 2026 FinanceTrack. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;
}

async function sendMail({ to, subject, html, developmentLink }) {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Missing EMAIL_USER or EMAIL_PASSWORD for production email delivery');
      return false;
    }

    console.log(`[email skipped] ${subject}: ${developmentLink}`);
    return true;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email delivery failed:', error);
    return false;
  }
}

async function sendPasswordResetEmail(email, userName, resetToken) {
  const resetLink = buildResetLink(resetToken);
  return sendMail({
    to: email,
    subject: 'Recuperacao de Senha - FinanceTrack',
    developmentLink: resetLink,
    html: getPasswordResetTemplate(userName, resetLink),
  });
}

module.exports = {
  sendPasswordResetEmail,
};
