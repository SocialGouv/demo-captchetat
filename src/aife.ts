const API_TOKEN_URL =
  process.env.API_TOKEN_URL ||
  "https://sandbox-oauth.piste.gouv.fr/api/oauth/token";
const API_CLIENT_ID = process.env.API_CLIENT_ID || "";
const API_CLIENT_SECRET = process.env.API_CLIENT_SECRET || "";

export type OAuthCreds = { access_token: string; token_type: string };

// fetch oauth token
export const fetchCreds = (): Promise<OAuthCreds> =>
  fetch(API_TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "WRITE",
      client_id: API_CLIENT_ID,
      client_secret: API_CLIENT_SECRET,
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(async (r) => {
    if (r.status === 200) {
      return r.json();
    }
    const text = await r.text();
    console.log("fetchCreds error", text);
  });
