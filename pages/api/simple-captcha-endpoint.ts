import type { NextApiRequest, NextApiResponse } from "next";

const API_CAPTCHA_URL =
  process.env.API_CAPTCHA_URL ||
  "https://sandbox-api.piste.gouv.fr/piste/captcha/simple-captcha-endpoint";

import { OAuthCreds, fetchCreds } from "../../src/aife";

// fetch CaptchEtat API
const fetchCaptcha = (
  creds: OAuthCreds,
  params = {} as Record<string, string>
): Promise<any> => {
  const url = API_CAPTCHA_URL + "?" + new URLSearchParams(params).toString();
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${creds.token_type} ${creds.access_token}`,
    },
  });
};

const sendBlob = async (
  res: NextApiResponse,
  blob: Blob,
  contentType: string
) => {
  const buffer = Buffer.from(await blob.arrayBuffer());
  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": buffer.length,
  });
  res.end(buffer, "binary");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const creds = await fetchCreds();
  const params = req.query as Record<string, string>;
  const captcha = await fetchCaptcha(creds, params);
  // todo: use direct response streaming so we keep original headers and dont need that switch
  if (params.get === "image") {
    sendBlob(res, await captcha.blob(), "image/png");
  } else if (params.get === "sound") {
    sendBlob(res, await captcha.blob(), "audio/x-wav");
  } else {
    res.send(await captcha.text());
  }
}
