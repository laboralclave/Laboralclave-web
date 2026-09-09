export async function onRequestGet(context) {
  const { env } = context;

  try {
    let tokens = await env.TIKTOK_KV.get("tiktok_tokens", "json");

    if (!tokens || !tokens.refresh_token) {
      return jsonResponse(
        { error: "TikTok no está conectado." },
        401
      );
    }

    const savedAt = tokens.saved_at
      ? new Date(tokens.saved_at).getTime()
      : 0;

    const expiresIn = Number(tokens.expires_in || 0) * 1000;

    const tokenExpired =
      !tokens.access_token ||
      !savedAt ||
      !expiresIn ||
      Date.now() >= savedAt + expiresIn - 60000;

    if (tokenExpired) {
      tokens = await refreshAccessToken(env, tokens);
    }

    let videoResponse = await requestVideos(tokens.access_token);

    if (videoResponse.status === 401) {
      tokens = await refreshAccessToken(env, tokens);
      videoResponse = await requestVideos(tokens.access_token);
    }

    const videoData = await videoResponse.json();

    if (
      !videoResponse.ok ||
      (videoData.error &&
        videoData.error.code &&
        videoData.error.code !== "ok")
    ) {
      return jsonResponse(
        {
          error: "TikTok no ha podido devolver los vídeos.",
          details: videoData.error || null
        },
        502
      );
    }

    const videos = (videoData.data?.videos || [])
      .sort((a, b) => Number(b.create_time) - Number(a.create_time))
      .slice(0, 2);

    return jsonResponse({ videos }, 200);

  } catch (error) {
    return jsonResponse(
      {
        error: "Error interno al consultar TikTok.",
        message: error.message
      },
      500
    );
  }
}

async function requestVideos(accessToken) {
  const fields = [
    "id",
    "title",
    "video_description",
    "create_time",
    "cover_image_url",
    "share_url",
    "embed_link",
    "duration"
  ].join(",");

  return fetch(
    `https://open.tiktokapis.com/v2/video/list/?fields=${fields}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        max_count: 2
      })
    }
  );
}

async function refreshAccessToken(env, currentTokens) {
  const body = new URLSearchParams({
    client_key: env.TIKTOK_SANDBOX_CLIENT_KEY,
    client_secret: env.TIKTOK_SANDBOX_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: currentTokens.refresh_token
  });

  const response = await fetch(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    }
  );

  const refreshed = await response.json();

  if (!response.ok || !refreshed.access_token) {
    throw new Error("No se ha podido renovar el acceso a TikTok.");
  }

  const newTokens = {
    access_token: refreshed.access_token,
    refresh_token:
      refreshed.refresh_token || currentTokens.refresh_token,
    expires_in: refreshed.expires_in,
    refresh_expires_in: refreshed.refresh_expires_in,
    open_id: refreshed.open_id,
    scope: refreshed.scope,
    saved_at: Date.now()
  };

  await env.TIKTOK_KV.put(
    "tiktok_tokens",
    JSON.stringify(newTokens)
  );

  return newTokens;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
