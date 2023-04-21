import { PrismaClient } from '@prisma/client';
import { Express, Request, Response } from 'express';

import { GENERIC_ERROR_MESSAGE } from './../constants/errors';

export const courseRoutes = (app: Express, prisma: PrismaClient, ROUTES: Record<string, string>) => {
  app.get(ROUTES.CURSOS, async (_: Request, res: Response) => {
    try {
      const response = await prisma.cursos.findMany();
      res.json({ response });
    } catch (err) {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE, description: JSON.stringify(err) });
    }
  });

  app.get(ROUTES.CURSO, async (req: Request, res: Response) => {
    const course_url = req.query?.course_url;

    try {
      const response = await prisma.cursos.findMany({ where: { course_url: String(course_url) } });
      res.json({ ...response?.[0] });
    } catch (err) {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE, description: JSON.stringify(err) });
    }
  });
};
