import { PrismaClient } from '@prisma/client';
import { Express, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { isEmpty } from 'lodash';
import bcrypt from 'bcrypt';

import { validateEmail, validatePassword } from '../constants/utils';
import { GENERIC_ERROR_MESSAGE, USER_ALREADY_EXIST_ERROR_MESSAGE } from './../constants/errors';

export const registerRoutes = (app: Express, prisma: PrismaClient, ROUTES: Record<string, string>) => {
  app.post(ROUTES.REGISTER, async (req: Request, res: Response) => {
    const body = req?.body;
    const email = body?.email;
    const password = body?.password;
    const firstName = body?.firstName;
    const lastName = body?.lastName;

    // check if user exist
    try {
      const response = await prisma.$queryRaw`SELECT id FROM users WHERE email = ${email}`;
      if (!isEmpty(response)) {
        res.status(409).json({ error: USER_ALREADY_EXIST_ERROR_MESSAGE, description: null });
        return false;
      }
    } catch (err) {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE, description: JSON.stringify(err) });
      return false;
    }

    // validate email && password
    if (email && !validateEmail(email)) {
      res.status(400).json({ error: 'Invalid Email Format', description: null });
      return false;
    }

    if (password && !validatePassword(password).isValid) {
      res.status(400).json({ error: validatePassword(password).error, description: null });
      return false;
    }

    const hash = await bcrypt.hash(password, 10);

    try {
      const response = await prisma.users.create({ data: { email: email, password: hash } });
      if (response.id) {
        await prisma.users_information.create({
          data: { id_user: response.id, name: firstName, last_name: lastName },
        });
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
