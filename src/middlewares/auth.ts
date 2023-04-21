const jwt = require('jsonwebtoken');

import { Request, Response, NextFunction } from 'express';

export const auth = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).send('Acceso denegado.');
    }
    const onlyToken = token.split(' ')[1];
    const decoded = await jwt.verify(onlyToken, String(process.env.JWT_PASSWORD));

    res.locals.userId = decoded?.userId;
    res.locals.email = decoded?.email;

    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};
