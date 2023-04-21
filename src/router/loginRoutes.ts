import { PrismaClient } from '@prisma/client';
import { Express, Request, response, Response } from 'express';
import jwt from 'jsonwebtoken';
import { isEmpty } from 'lodash';
import bcrypt from 'bcrypt';

import { validateEmail, validatePassword } from '../constants/utils';
import { GENERIC_ERROR_MESSAGE } from './../constants/errors';

export const loginRoutes = (app: Express, prisma: PrismaClient, ROUTES: Record<string, string>) => {
  app.post(ROUTES.LOGIN, async (req: Request, res: Response) => {
    const body = req?.body;
    const email = body?.email;
    const password = body?.password;

    // check if user exist
    try {
      // validate email && password
      if (email && !validateEmail(email)) {
        res.status(400).json({ error: 'Invalid Email Format', description: null });
        return false;
      }

      if (password && !validatePassword(password).isValid) {
        res.status(400).json({ error: validatePassword(password).error, description: null });
        return false;
      }

      const response = await prisma.users.findUnique({ where: { email } });
      console.log('response', response);
      if (isEmpty(response)) {
        res.status(401).json({ error: 'Correo electrónico o contraseña inválidos', description: null });
        return false;
      }

      const isPasswordValid = await bcrypt.compare(password, response.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Correo electrónico o contraseña inválidos', description: null });
        return false;
      }

      if (response.id) {
        const token = jwt.sign({ userId: response.id, email: email }, String(process.env.JWT_PASSWORD), {
          expiresIn: '24h',
        });
        res.json({ response: { token } });
        return false;
      } else {
        res.status(500).json({ error: GENERIC_ERROR_MESSAGE, description: null });
        return false;
      }
    } catch (err) {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE, description: JSON.stringify(err) });
      return false;
    }
  });
};
