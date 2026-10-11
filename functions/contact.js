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

    const web3formsResponse = await fetch(
      "https://api.web3forms.com/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: "c2005792-1ca8-4571-9c80-fa22cc51a9e0",
          subject: `Nueva consulta web: ${tema}`,
          from_name: "LaboralClave",
          name: nombre,
          email: email,
          replyto: email,
          message:
            `Nueva consulta recibida desde LaboralClave\n\n` +
            `Nombre: ${nombre}\n` +
            `Email: ${email}\n` +
            `Tema: ${tema}\n\n` +
            `Mensaje:\n${mensaje}`
        })
      }
    );

    const result = await web3formsResponse.json();

    console.log("Respuesta Web3Forms:", result);

    if (!web3formsResponse.ok || !result.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Web3Forms ha rechazado el envío.",
          web3forms_status: web3formsResponse.status,
          web3forms_response: result
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
        ok: true
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Error en /contact:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Se ha producido un error al procesar la solicitud."
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
