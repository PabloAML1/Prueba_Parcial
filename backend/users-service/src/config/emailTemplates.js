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

export const WELCOME_TEMPLATE=`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Bienvenido a Nuestro Servicio</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 50px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
    h1 { color: #1a73e8; }
    p { color: #555555; line-height: 1.5; font-size: 16px; }
    .footer { font-size: 12px; color: #999999; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>¡Bienvenido, {{name}}!</h1>
    <p>Nos alegra que te hayas unido a nuestro servicio. Estamos emocionados de tenerte con nosotros y esperamos que disfrutes de todas las funcionalidades que ofrecemos.</p>
    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
    <div class="footer">
      Saludos,<br>
      El equipo de soporte
    </div>
  </div>
</body>
</html>
`;