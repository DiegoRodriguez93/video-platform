import { Express } from 'express';
import http from 'http';

export const server = (app: Express) => {
  const HTTP_PORT = process.env.PORT || 3001;
  const HTTPS_PORT = process.env.HTTPS_PORT || 443;

  http.createServer(app).listen(HTTP_PORT);

  console.info(`Server running on ports ${HTTP_PORT} & ${HTTPS_PORT}`);
};
