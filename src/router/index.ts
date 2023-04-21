import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();
import { Express } from 'express';

import { videoRoutes } from './videoRoutes';
import { courseRoutes } from './courseRoutes';
import { registerRoutes } from './registerRoutes';
import { loginRoutes } from './loginRoutes';
import { newCourseRoutes } from './newCourseRoutes';
import { paymentRoutes } from './paymentRoutes';

const ROUTES: Record<string, string> = {
  VIDEOS: '/video', // POST, GET
  TEST: '/test',
  CURSO: '/curso', // PATCH, GET,
  CURSOS: '/cursos', // GET,
  LOGIN: '/login', // POST
  REGISTER: '/register', // REGISTER
  NEW_COURSE_STEP_1: '/new-course-step-1', // POST
  NEW_COURSE_STEP_2: '/new-course-step-2', // POST
  NEW_COURSE_STEP_3: '/new-course-step-3', // POST
  PAYMENT_PAYPAL: '/payment-paymal', // POST
  PAYMENT_MERCADO_PAGO_ARG: '/payment-mercadopago-arg', // POST, GET
};

export default function router(app: Express, prisma: PrismaClient) {
  // videoRoutes(app, prisma, ROUTES);
  registerRoutes(app, prisma, ROUTES);
  loginRoutes(app, prisma, ROUTES);
  newCourseRoutes(app, prisma, ROUTES);
  courseRoutes(app, prisma, ROUTES);
  paymentRoutes(app, prisma, ROUTES);
}
