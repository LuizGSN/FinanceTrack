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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FinanceTrack</h1>
    </div>
    <div class="content">
      <h2>Bem-vindo, ${userName}!</h2>
      <p>Confirme seu e-mail para ativar sua conta:</p>
      <a href="${confirmationLink}" class="button">Confirmar E-mail</a>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p style="word-break: break-all; color: #0066cc;">${confirmationLink}</p>
      <p style="color: #999; font-size: 12px;">Este link expira em 24 horas.</p>
    </div>
    <div class="footer">
      <p>Você recebeu este e-mail porque se registrou em FinanceTrack</p>
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FinanceTrack</h1>
    </div>
    <div class="content">
      <h2>Recuperação de Senha</h2>
      <p>Olá ${userName},</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
      <a href="${resetLink}" class="button">Resetar Senha</a>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p style="word-break: break-all; color: #0066cc;">${resetLink}</p>
      <p style="color: #999; font-size: 12px;">Este link expira em 1 hora.</p>
      <p style="color: #999; font-size: 12px;">Se não solicitou esta recuperação, ignore este e-mail.</p>
    </div>
    <div class="footer">
      <p>Por segurança, nunca compartilhe seus links de recuperação</p>
    </div>
  </div>
</body>
</html>
`;

// Enviar e-mail de confirmação
async function sendConfirmationEmail(email, userName, confirmationToken) {
  const confirmationLink = \`\${process.env.FRONTEND_URL}/confirm-email?token=\${confirmationToken}\`;

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
  const resetLink = \`\${process.env.FRONTEND_URL}/reset-password?token=\${resetToken}\`;

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
