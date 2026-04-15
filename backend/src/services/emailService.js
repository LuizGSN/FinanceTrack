const nodemailer = require('nodemailer');

// Configurar transporte de email (usar variáveis de ambiente para produção)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Template de e-mail de confirmação
const getConfirmationEmailTemplate = (userName, confirmationLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e5e5e5; background: #050505; }
    .container { max-width: 500px; margin: 0 auto; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; background: #0a0a0a; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
    .header { background: linear-gradient(135deg, #D4A017 0%, #b8860b 100%); color: #0A0A0A; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; }
    .content { padding: 30px 20px; }
    .content h2 { color: #D4A017; font-size: 20px; margin-top: 0; }
    .content p { color: #999; margin: 15px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #D4A017 0%, #b8860b 100%); color: #0A0A0A; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: bold; border: none; cursor: pointer; }
    .button:hover { opacity: 0.9; }
    .link-text { word-break: break-all; color: #D4A017; font-family: monospace; font-size: 12px; background: #111; padding: 10px; border-radius: 6px; border: 1px solid #1a1a1a; }
    .footer { background: #050505; padding: 15px 20px; text-align: center; font-size: 12px; color: #555; border-top: 1px solid #1a1a1a; }
    .highlight { color: #D4A017; font-weight: bold; }
  </style>
</head>
<body style="background: #050505; margin: 0; padding: 20px;">
  <div class="container">
    <div class="header">
      <h1>✓ FinanceTrack</h1>
    </div>
    <div class="content">
      <h2>Bem-vindo, ${userName}!</h2>
      <p>Obrigado por se registrar no <span class="highlight">FinanceTrack</span>. Confirme seu e-mail para ativar sua conta:</p>
      <center>
        <a href="${confirmationLink}" class="button" style="text-decoration: none;">Confirmar E-mail</a>
      </center>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p class="link-text">${confirmationLink}</p>
      <p style="color: #666; font-size: 12px;">Este link expira em 24 horas.</p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">Se não criou uma conta em FinanceTrack, ignore este e-mail.</p>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2026 FinanceTrack. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

// Template de recuperação de senha
const getPasswordResetTemplate = (userName, resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e5e5e5; background: #050505; }
    .container { max-width: 500px; margin: 0 auto; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; background: #0a0a0a; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
    .header { background: linear-gradient(135deg, #D4A017 0%, #b8860b 100%); color: #0A0A0A; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; }
    .content { padding: 30px 20px; }
    .content h2 { color: #D4A017; font-size: 20px; margin-top: 0; }
    .content p { color: #999; margin: 15px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #D4A017 0%, #b8860b 100%); color: #0A0A0A; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: bold; border: none; cursor: pointer; }
    .button:hover { opacity: 0.9; }
    .link-text { word-break: break-all; color: #D4A017; font-family: monospace; font-size: 12px; background: #111; padding: 10px; border-radius: 6px; border: 1px solid #1a1a1a; }
    .warning { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px; border-radius: 6px; color: #ef4444; font-size: 12px; margin-top: 15px; }
    .footer { background: #050505; padding: 15px 20px; text-align: center; font-size: 12px; color: #555; border-top: 1px solid #1a1a1a; }
    .highlight { color: #D4A017; font-weight: bold; }
  </style>
</head>
<body style="background: #050505; margin: 0; padding: 20px;">
  <div class="container">
    <div class="header">
      <h1>🔒 FinanceTrack</h1>
    </div>
    <div class="content">
      <h2>Recuperação de Senha</h2>
      <p>Olá <span class="highlight">${userName}</span>,</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar:</p>
      <center>
        <a href="${resetLink}" class="button" style="text-decoration: none;">Redefinir Senha</a>
      </center>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p class="link-text">${resetLink}</p>
      <p style="color: #666; font-size: 12px;">Este link expira em 1 hora.</p>
      <div class="warning">
        ⚠️ Se não solicitou uma recuperação de senha, <span style="font-weight: bold;">ignore este e-mail</span>. Sua conta permanecerá segura.
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2026 FinanceTrack. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

// Enviar e-mail de confirmação
async function sendConfirmationEmail(email, userName, confirmationToken) {
  const confirmationLink = `${process.env.FRONTEND_URL}/?token=${confirmationToken}&type=confirm`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Confirme seu e-mail - FinanceTrack',
      html: getConfirmationEmailTemplate(userName, confirmationLink),
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de confirmação:', error);
    return false;
  }
}

// Enviar e-mail de recuperação de senha
async function sendPasswordResetEmail(email, userName, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/?token=${resetToken}&type=reset`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperação de Senha - FinanceTrack',
      html: getPasswordResetTemplate(userName, resetLink),
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de recuperação:', error);
    return false;
  }
}

module.exports = {
  sendConfirmationEmail,
  sendPasswordResetEmail,
};
