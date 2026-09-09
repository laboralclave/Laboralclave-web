export async function onRequestGet(context) {
  const { env } = context;

  const clientKey = env.TIKTOK_SANDBOX_CLIENT_KEY;
  const redirectUri = "https://www.laboralclave.com/tiktok/callback/";

  if (!clientKey) {
    return new Response("Falta TIKTOK_CLIENT_KEY", { status: 500 });
  }

  const state = crypto.randomUUID();

  await env.TIKTOK_KV.put(
    `oauth_state:${state}`,
    "valid",
    { expirationTtl: 600 }
  );

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: "user.info.basic,video.list",
    response_type: "code",
    redirect_uri: redirectUri,
    state: state
  });

  return Response.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`,
    302
  );
}
