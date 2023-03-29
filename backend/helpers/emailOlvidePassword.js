import nodemailer from "nodemailer";

const emailOlvidePassword = async (datos) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  //Enviar el email
  
  const info = await transporter.sendMail({
    from: "LavaSoft - Administrador de Clientes de LavaSoft",
    to: email,
    subject: "Instrucciones para reestablecer tu contraseña en LavaSoft",
    html: `
    <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #2d4059;">Hola ${nombre},</h2>
  
      <p style="font-size: 16px;">Gracias por utilizar LavaSoft. Para reestablecer tu contraseña, sigue los siguientes pasos:</p>
  
      <ol style="font-size: 16px;">
        <li>Haz clic en el siguiente enlace para reestablecer tu contraseña:</li>
        <li style="margin-top: 10px;"><a href="${process.env.FRONTEND_URL}/nuevo-password/${token}" style="color: #2d4059; text-decoration: none; font-size: 18px;">Reestablecer Contraseña</a></li>
        <li>Ingresa tu nueva contraseña.</li>
        <li>Confirma tu nueva contraseña.</li>
      </ol>
  
      <p style="font-size: 16px;">Recuerda que para proteger tu cuenta, te recomendamos que utilices una contraseña segura y que no la compartas con nadie.</p>
  
      <p style="font-size: 16px;">Si no solicitaste el reestablecimiento de tu contraseña, por favor ignora este mensaje.</p>
  
      <p style="font-size: 16px;">¡Que tengas un buen día!</p>
  
      <p style="font-size: 16px;">El equipo de LavaSoft</p>
    </div>
    `,
  });
  
  console.log("Mensaje enviado: %s", info.messageId);
  
};

export default emailOlvidePassword;
