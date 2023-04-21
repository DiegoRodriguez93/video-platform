import { PrismaClient } from '@prisma/client';
import { Express, Request, response, Response } from 'express';
import jwt from 'jsonwebtoken';
import mercadopago from 'mercadopago';

import { GENERIC_ERROR_MESSAGE } from './../constants/errors';
import { auth } from '../middlewares/auth';
import axios from 'axios';

mercadopago.configurations.setAccessToken('TEST-7780899479236387-011820-757fdf9b2fa3b975a1409c343f3a527e-159728357');

type PaymentDataType = {
  transaction_amount: number;
  token: string;
  installments: number;
  payment_method_id: string;
  payer: {
    first_name: string;
    last_name: string;
    address: {};
    email: string;
  };
};

export const paymentRoutes = (app: Express, prisma: PrismaClient, ROUTES: Record<string, string>) => {
  app.post(
    ROUTES.PAYMENT_PAYPAL,
    /* auth(), */ async (req: Request, res: Response) => {
      const body = req?.body;
      const amount = body?.amount;
      const card = body?.card;
    },
  );

  app.get(ROUTES.PAYMENT_MERCADO_PAGO_ARG, async (req: Request, res: Response) => {
    // const response = await mercadopago.p ;
    // const payment_methods = response.body;

    const config = {
      headers: {
        Authorization: `Bearer TEST-7780899479236387-011820-757fdf9b2fa3b975a1409c343f3a527e-159728357`,
      },
    };
    const url = 'https://api.mercadopago.com/v1/payment_methods';
    try {
      const paymentMethods = await axios.get(url, config);
      console.log(paymentMethods);
      return res.status(200).json({ response: paymentMethods });
    } catch (error) {
      return res.status(400).json({ error: GENERIC_ERROR_MESSAGE, err: error });
    }
  });

  app.post(
    ROUTES.PAYMENT_MERCADO_PAGO_ARG,
    /* auth(), */ async (req: Request, res: Response) => {
      const body = req?.body;
      const amount = body?.amount;
      const card = body?.card;

      const paymentData: PaymentDataType = {
        transaction_amount: 100,
        token: '9543b0325dc00040cce1b5461ac4060f',
        installments: 1,
        payment_method_id: 'master',
        payer: {
          first_name: 'Test',
          last_name: 'Test',
          email: 'diegorodriguez93@hotmail.com',
          address: {},
        },
      };

      mercadopago.payment
        .create(paymentData)
        .then(function (data) {
          console.log(data.body.status);
          if (data.body.status === 'approved') {
            res.status(200).json({ response: 'El pago ha sido procesado correctamente!' });
          } else {
            res.status(400).json({ error: GENERIC_ERROR_MESSAGE });
          }
        })
        .catch((err) => res.status(400).json({ error: GENERIC_ERROR_MESSAGE, err }));
    },
  );

  app.post(
    ROUTES.NEW_COURSE_STEP_3,
    /* auth() */ async (req: Request, res: Response) => {
      try {
        const body = req?.body;
        const isPublic = body?.public === 'true';
        const cursoId = Number(body?.cursoId);
        const response = await prisma.cursos.update({ data: { public: isPublic }, where: { id: cursoId } });
        return res.status(200).json({ response });
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error: GENERIC_ERROR_MESSAGE, data: req?.body, err: error });
      }
    },
  );
};
