import type { NextApiRequest, NextApiResponse } from "next";

const API_VALIDATE_URL =
  process.env.API_VALIDATE_URL ||
  "https://sandbox-api.piste.gouv.fr/piste/captcha/valider-captcha";

import { OAuthCreds, fetchCreds } from "../../src/aife";

// validate CaptchEtat API
const validateCaptcha = (
  creds: OAuthCreds,
  params = {} as Record<string, string>
): Promise<any> => {
  return fetch(API_VALIDATE_URL, {
    method: "POST",
    body: JSON.stringify({
      code: params.code,
      id: params.id,
    }),
    headers: {
      Authorization: `${creds.token_type} ${creds.access_token}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
  }).then((r) => r.text());
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const creds = await fetchCreds();
  const params = req.body as Record<string, string>;
  const captcha = await validateCaptcha(creds, params);
  res.send({ success: captcha === "true" });
}
