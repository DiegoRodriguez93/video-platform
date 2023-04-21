import { PrismaClient } from '@prisma/client';
import { Express, Request, response, Response } from 'express';
import jwt from 'jsonwebtoken';
import { isEmpty, lowerCase, kebabCase } from 'lodash';
import bcrypt from 'bcrypt';
import fileUpload from 'express-fileupload';
import fs from 'fs';

import { validateEmail, validatePassword } from '../constants/utils';
import { GENERIC_ERROR_MESSAGE } from './../constants/errors';
import { auth } from '../middlewares/auth';
import { s3 } from '../connection/s3bucket';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

export const newCourseRoutes = (app: Express, prisma: PrismaClient, ROUTES: Record<string, string>) => {
  app.use(fileUpload({ useTempFiles: true, tempFileDir: './tmp/' }));
  app.post(
    ROUTES.NEW_COURSE_STEP_1,
    /* auth(), */ async (req: Request, res: Response) => {
      const body = req?.body;
      const name_of_course = body?.name_of_course;
      const course_url = kebabCase(lowerCase(name_of_course));
      const price_arg = body?.priceARG;
      const price_usd = body?.priceUSD;
      const description = body?.description;
      const profesorsIds = body?.profesorsIds.split(',');
      const avatarFile = req.files?.avatar;

      const response = await prisma.cursos.create({
        data: { name_of_course, price_arg, price_usd, description, public: false, course_url, cover_img: '' },
      });

      const cursoId = response.id;
      const profersorPromises: any = [];

      profesorsIds.forEach((profesorId: string) =>
        profersorPromises.push(
          prisma.profesors_curso.create({ data: { id_curso: cursoId, id_profesor: Number(profesorId) } }),
        ),
      );

      Promise.all(profersorPromises)
        .then(() => {
          return res.status(200).json({ id_curso: cursoId });
        })
        .catch(() => {
          return res.status(400).json({ error: GENERIC_ERROR_MESSAGE, description: null });
        });

      // TODO: integrate avatar file

      console.log(response);
      console.log(avatarFile);
      // console.log(res.locals);

      // return res.status(400).json({ error: 'Invalid Email Format', description: null });
    },
  );

  app.post(
    ROUTES.NEW_COURSE_STEP_2,
    /* auth(), */ async (req: Request, res: Response) => {
      const body = req?.body;
      const files: any = req?.files;

      const key = body?.key;
      const cursoId = body?.id_curso;
      const videoName = body?.[key];
      const order_curso = Number(key.replaceAll('video', ''));
      const organizationId = body?.organization_id;

      const filePath = './' + files?.[key]?.['tempFilePath'];
      const awsDir = `videos/${organizationId}/${cursoId}/${key}/`;
      console.log('awsDir', awsDir);
      const dir = `./tmp/${Math.floor(Date.now() / 1000)}/`;

      // craete dir to convert mp4 file to m3u8 file
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      // convert file
      ffmpeg(filePath)
        .audioCodec('libopus')
        .audioBitrate(96)
        .outputOptions([
          '-codec: copy',
          '-hls_time 10',
          '-hls_playlist_type vod',
          `-hls_base_url https://mys3bucket-upload-videos.s3.amazonaws.com/${awsDir}`,
          `-hls_segment_filename ${dir}/%03d.ts`,
        ])
        .output(`${dir}/${key}.m3u8`)
        .on('progress', function (progress: any) {
          // console.log(progress);
          // console.log('Processing: ' + progress + '% done');
        })
        .on('end', function (err: any, stdout: any, stderr: any) {
          // console.log('Finished processing!', err, stdout, stderr);

          fs.readdir(dir, async (err, files) => {
            // remove original mp4 video
            fs.unlinkSync(filePath);

            const promises: Array<Promise<any>> = [];

            // upload videos to aws.s3 & save video url in mysql
            for (const file of files) {
              const data = fs.readFileSync(`${dir}${file}`);
              const params = {
                Bucket: 'mys3bucket-upload-videos',
                Key: `${awsDir}${file}`,
                Body: data,
                ACL: 'public-read',
              };

              if (file.includes('.m3u8')) {
                promises.push(
                  prisma.videos_curso.create({
                    data: {
                      id_curso: Number(cursoId),
                      name: videoName,
                      url: `https://mys3bucket-upload-videos.s3.amazonaws.com/${awsDir}${file}`,
                      order_curso,
                    },
                  }),
                );
              }

              promises.push(s3.upload(params).promise());
            }

            await Promise.all(promises).catch((err) => console.log(err));
            fs.rmdirSync(dir, { recursive: true });
            return res.status(200).json({ message: 'Video subido correctamente', key });
          });
        })
        .on('error', (err: any) => console.log('err' + err))
        .run();
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
