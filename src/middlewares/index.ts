import express, { Express } from 'express';
import cors from 'cors';

export default function middlewares(app: Express) {
  app.use(express.json());
  app.use(cors());
}
