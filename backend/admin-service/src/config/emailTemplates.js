export const EMAIL_VERIFY_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Verificación de correo</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 50px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #333333; }
    p { color: #555555; line-height: 1.5; }
    .otp { font-size: 24px; font-weight: bold; color: #1a73e8; margin: 20px 0; text-align: center; }
    .footer { font-size: 12px; color: #999999; margin-top: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hola {{email}},</h2>
    <p>¡Gracias por registrarte en nuestro servicio! Para completar la verificación de tu cuenta, utiliza el siguiente código OTP:</p>
    <div class="otp">{{otp}}</div>
    <p>Este código es válido por 24 horas. Si no solicitaste esta verificación, simplemente ignora este correo.</p>
    <div class="footer">
      Saludos,<br>
      El equipo de soporte
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Restablecimiento de contraseña</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 50px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #333333; }
    p { color: #555555; line-height: 1.5; }
    .otp { font-size: 24px; font-weight: bold; color: #e91e63; margin: 20px 0; text-align: center; }
    .footer { font-size: 12px; color: #999999; margin-top: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hola {{email}},</h2>
    <p>Hemos recibido una solicitud para restablecer tu contraseña. Para continuar, utiliza el siguiente código OTP:</p>
    <div class="otp">{{otp}}</div>
    <p>Este código es válido por 15 minutos. Si no solicitaste un restablecimiento de contraseña, puedes ignorar este correo.</p>
    <div class="footer">
      Saludos,<br>
      El equipo de soporte
    </div>
  </div>
</body>
</html>
`;

export const WELCOME_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Bienvenido(a)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin:0; background:#0b1220; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, "Helvetica Neue", sans-serif; color:#e5e7eb; }
    .container { max-width:600px; margin:40px auto; background:#0f172a; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,.35); overflow:hidden; }
    .header { background:#0ea5e9; color:#fff; padding:28px 24px; text-align:center; }
    .header h1 { margin:0; font-size:22px; font-weight:700; }
    .content { padding:28px 24px; }
    .greeting { font-size:16px; margin:0 0 12px; }
    .paragraph { font-size:15px; line-height:1.6; margin:0 0 18px; color:#cbd5e1; }
    .card { background:#0b1220; border:1px solid #1f2a44; border-radius:10px; padding:16px; margin:16px 0; }
    .label { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:#6b7280; margin-bottom:6px; }
    .value { font-size:15px; font-weight:600; color:#f1f5f9; word-break:break-all; }
    .cta { display:inline-block; padding:12px 18px; border-radius:10px; text-decoration:none; background:#1a73e8; color:#fff; font-weight:700; margin-top:8px; }
    .warn { background:#2a190b; border:1px solid #7c3a0a; color:#fde68a; padding:12px; border-radius:10px; font-size:13px; line-height:1.5; }
    .footer { text-align:center; font-size:12px; color:#94a3b8; padding:20px 18px 28px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido(a), {{name}}!</h1>
    </div>
    <div class="content">
      <p class="greeting">Nos alegra que te unas al sistema.</p>
      <p class="paragraph">
        A continuación te compartimos tus credenciales iniciales. Te recomendamos iniciar sesión cuanto antes y cambiar tu contraseña.
      </p>

      <div class="card">
        <div class="label">Correo</div>
        <div class="value">{{email}}</div>
        <div class="label" style="margin-top:10px;">Contraseña</div>
        <div class="value">{{password}}</div>
      </div>

      <a class="cta" href="{{loginUrl}}" target="_blank" rel="noopener">Ir a iniciar sesión</a>

      <p class="paragraph" style="margin-top:18px;">
        Si necesitas ayuda, responde a este correo y con gusto te apoyaremos.
      </p>

      <div class="warn" style="margin-top:16px;">
        <strong>Importante:</strong> Esta información es confidencial. <u>No la compartas con nadie</u>. 
        Si no reconoces este mensaje, contáctanos de inmediato.
      </div>
    </div>

    <div class="footer">
      Saludos,<br />Equipo de Soporte
    </div>
  </div>
</body>
</html>`;
