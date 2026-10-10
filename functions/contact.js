export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const nombre = String(data.nombre || "").trim();
    const email = String(data.email || "").trim();
    const tema = String(data.tema || "").trim();
    const mensaje = String(data.mensaje || "").trim();

    if (!nombre || !email || !tema || !mensaje) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Faltan datos obligatorios."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    if (!context.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY no está configurada.");
      return new Response(
        JSON.stringify({
          ok: false,
          error: "El servidor no tiene configurada la clave de correo."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "LaboralClave <info@laboralclave.com>",
        to: ["info@laboralclave.com"],
        reply_to: email,
        subject: `Nueva consulta web: ${tema}`,
        text: `Nueva consulta recibida desde LaboralClave

Nombre: ${nombre}
Email: ${email}
Tema: ${tema}

Mensaje:
${mensaje}`
      })
    });

    const responseText = await resendResponse.text();

    console.log("RESPUESTA RESEND:", resendResponse.status, responseText);

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Resend ha rechazado el envío.",
          resend_status: resendResponse.status,
          resend_response: responseText
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Consulta enviada correctamente."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("ERROR CONTACT:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Se ha producido un error al procesar la solicitud.",
        detail: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
