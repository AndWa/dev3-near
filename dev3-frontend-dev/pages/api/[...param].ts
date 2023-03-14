import httpProxy from "http-proxy";
import { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.API_URL;
const proxy = httpProxy.createProxyServer();

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = (
  req: NextApiRequest,
  res: NextApiResponse<any>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    proxy.web(req, res, { target: API_URL, changeOrigin: true }, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

export default handler;
