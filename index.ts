import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';

import middlewares from './src/middlewares';
import router from './src/router';
import { server } from './src/server';
import mysqlTest from './src/connection/mysqlTest';

const app: Express = express();

const prisma = new PrismaClient();

// mysqlTest();

middlewares(app);

server(app);

router(app, prisma);
