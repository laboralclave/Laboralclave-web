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

    const formSubmitResponse = await fetch(
      "https://formsubmit.co/ajax/info@laboralclave.com",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          nombre: nombre,
          email: email,
          tema: tema,
          mensaje: mensaje,

          _subject: `Nueva consulta web: ${tema}`,

          _replyto: email,

          _url: "https://www.laboralclave.com/contact"
        })
      }
    );

    const result = await formSubmitResponse.json();

    if (!formSubmitResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "FormSubmit ha rechazado el envío.",
          formsubmit_status: formSubmitResponse.status,
          formsubmit_response: result
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
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Se ha producido un error al procesar la solicitud.",
        detail: String(error)
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
