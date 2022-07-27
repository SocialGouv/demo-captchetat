import type { NextApiRequest, NextApiResponse } from "next";

const API_TOKEN_URL = process.env.API_TOKEN_URL || "https://sandbox-oauth.piste.gouv.fr/api/oauth/token";
const API_URL = process.env.API_URL || 
  "https://sandbox-api.piste.gouv.fr/piste/captcha/simple-captcha-endpoint";
const API_CLIENT_ID = process.env.API_CLIENT_ID || "";
const API_CLIENT_SECRET = process.env.API_CLIENT_SECRET || "";

type OAuthCreds = { access_token: string; token_type: string };

// fetch oauth token
const fetchCreds = (): Promise<OAuthCreds> =>
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

// fetch CaptchEtat API
const fetchCaptcha = (creds: OAuthCreds, params = {} as Record<string, string>): Promise<any> => {
  const url = API_URL + "?" + new URLSearchParams(params).toString();
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${creds.token_type} ${creds.access_token}`,
    },
  })
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const creds = await fetchCreds();
  const params = req.query as Record<string, string>
  const captcha = await fetchCaptcha(creds, params);
  if (params.get === "image") {
    const buffer = Buffer.from(await (await captcha.blob()).arrayBuffer())
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": buffer.length,
    });
    res.end(buffer, "binary");
  } else {
    res.send(await captcha.text())
  }

}
