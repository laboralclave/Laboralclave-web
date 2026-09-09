export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    return new Response(
      `TikTok no ha autorizado la conexión: ${errorDescription || error}`,
      { status: 400 }
    );
  }

  if (!code || !state) {
    return new Response("Faltan datos de autorización de TikTok.", {
      status: 400
    });
  }

  const stateKey = `oauth_state:${state}`;
  const savedState = await env.TIKTOK_KV.get(stateKey);

  if (savedState !== "valid") {
    return new Response("Estado de autorización no válido o caducado.", {
      status: 400
    });
  }

  await env.TIKTOK_KV.delete(stateKey);

  const redirectUri =
    "https://www.laboralclave.com/tiktok/callback/";

  const body = new URLSearchParams({
    client_key: env.TIKTOK_CLIENT_KEY,
    client_secret: env.TIKTOK_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri
  });

  const tokenResponse = await fetch(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    }
  );

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    return new Response(
      "No se ha podido completar la autorización con TikTok.",
      { status: 502 }
    );
  }

  await env.TIKTOK_KV.put(
    "tiktok_tokens",
    JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      refresh_expires_in: tokenData.refresh_expires_in,
      open_id: tokenData.open_id,
      scope: tokenData.scope,
      saved_at: Date.now()
    })
  );

  return Response.redirect(
    "https://www.laboralclave.com/?tiktok=connected",
    302
  );
}
