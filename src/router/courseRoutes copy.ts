import { PrismaClient } from '@prisma/client';
import { Express, Request, Response } from 'express';

import { GENERIC_ERROR_MESSAGE } from './../constants/errors';

export const courseRoutes = (app: Express, prisma: PrismaClient, ROUTES: Record<string, string>) => {
  /**
   * @param limit_date_of_discount String @db.VarChar(60)
   * @param price_usd              Int
   * @param price_arg              Int
   * @param price_usd_discount     Int
   * @param price_arg_discount     Int
   * @param price_usd_class        Int
   * @param price_arg_class        Int
   * @param title_of_course        String @db.VarChar(255)
   * @param date_to_show           String @db.VarChar(255)
   * @param hours_of_classes       String @db.VarChar(40)
   * @param class_duration         String @db.VarChar(40)
   * @param discount_rate          Int
   */
  app.put(ROUTES.COURSE, async (req: Request, res: Response) => {
    const body = req.body;

    const newBody = {
      limit_date_of_discount: String(body?.limit_date_of_discount),
      price_usd: Number(body?.price_usd),
      price_arg: Number(body?.price_arg),
      price_usd_class: Number(body?.price_usd_class),
      price_arg_class: Number(body?.price_arg_class),
      title_of_course: String(body?.title_of_course),
      date_to_show: String(body?.date_to_show),
      hours_of_classes: String(body?.hours_of_classes),
      class_duration: String(body?.class_duration),
      discount_rate: Number(body?.discount_rate),
      price_usd_discount: Math.round(
        Number(body?.price_usd) - Number(body?.price_usd) * Number(`.${body?.discount_rate}`),
      ),
      price_arg_discount: Math.round(
        Number(body?.price_arg) - Number(body?.price_arg) * Number(`.${body?.discount_rate}`),
      ),
    };

    try {
      const response = await prisma.curso_config.update({
        where: { id_curso: 1 },
        data: newBody,
      });
      res.json({ response });
    } catch (err) {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE, description: JSON.stringify(err) });
    }
  });

  app.get(ROUTES.COURSE, async (_: Request, res: Response) => {
    try {
      const response = await prisma.curso_config.findUnique({
        where: { id_curso: 1 },
      });
      res.json({ response });
    } catch (err) {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE, description: JSON.stringify(err) });
    }
  });

  app.post(ROUTES.RESET_COURSE, async (_: Request, res: Response) => {
    try {
      const response = await prisma.$executeRaw`TRUNCATE TABLE entrenamiento_integral_v;TRUNCATE TABLE auto_save;`;

      res.json({ response });
    } catch (err) {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE, description: JSON.stringify(err) });
    }
  });
};
