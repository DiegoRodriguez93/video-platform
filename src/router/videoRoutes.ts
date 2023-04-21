import { PrismaClient } from '@prisma/client';
import { Express, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { s3 } from './../connection/s3bucket';
import fs from 'fs';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

import { GENERIC_ERROR_MESSAGE } from '../constants/errors';

export const videoRoutes = (app: Express, prisma: PrismaClient, ROUTES: Record<string, string>) => {
  app.use(fileUpload({ useTempFiles: true, tempFileDir: '/src/tmp/' }));
  app.post(ROUTES.VIDEOS, async (req: any, res: Response) => {
    try {
      // console.log(req);
      const body = req.body;

      const data: any = req?.files?.file;

      const filePath = 'src/tmp/' + req.files?.file?.name;

      // req.files.file.mv(filePath, (err: any) => console.log(err));

      // const a = fs.readFile('/src/tmb/crazy.mp4', (err) => console.log(err));

      /*       ffmpeg('C://Users/diego/Desktop/git/video_platform/src/tmp/crazy.mp4')
        .videoCodec('libx264')
        .output('src/tmp/out.m3u8')
        .on('end', (err: any, data: any) => {
          console.log(data);
          console.log('end');
        })
        .run(); */
      /*       ffmpeg('src/tmp/crazy.mp4')
        .addOptions(['-c:v', 'h264'])
        .output('src/tmp/out.m3u8')
        .on('end', (err: any, data: any) => {
          console.log(data);
          console.log('end');
        })
        .run(); */

      const command = ffmpeg('src/tmp/crazy.mp4')
        .audioCodec('libopus')
        .audioBitrate(96)
        .outputOptions([
          '-codec: copy',
          '-hls_time 10',
          '-hls_playlist_type vod',
          '-hls_base_url http://localhost:3001/',
          '-hls_segment_filename src/tmp/%03d.ts',
        ])
        .output('src/tmp/crazy.m3u8')
        .on('progress', function (progress: any) {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .on('end', function (err: any, stdout: any, stderr: any) {
          console.log('Finished processing!', err, stdout, stderr);
        })
        .on('error', (err: any) => console.log('err' + err))
        .run();

      const params = {
        Bucket: 'mys3bucket-upload-videos', // pass your bucket name
        Key: 'test2.mp4', // file will be saved as testBucket/contacts.csv
        Body: data,
      };
      /*       s3.upload(params, function (s3Err: any, dataa: any) {
        if (s3Err) throw s3Err;
        console.log(`File uploaded successfully at ${dataa?.Location}`);
      });
 */
      /*       if (req.body.classes.length < 1) {
        res.status(404).json({ error: 'Al menos una clase es requerida' });
        return;
      }

      if (!Array.isArray(req.body.classes)) {
        res.status(404).json({ error: 'Classes debe ser del tipo array' });
        return;
      }

      // CLEAN THE OLD CLASES
      const TABLE_NAME = 'clases';
      await prisma.$executeRawUnsafe(`TRUNCATE ${TABLE_NAME};`);

      const clases: Array<string> = req.body.classes;

      await Promise.all(
        clases.map((clase, index) =>
          prisma.clases.create({
            data: {
              id_curso: 1,
              name_of_class: clase,
              idx: index,
            },
          }),
        ),
      ); */
      // const response = await prisma.clases.findMany({ orderBy: { idx: 'asc' } });
      // res.json({ response });
    } catch {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
    }
  });

  app.get(ROUTES.VIDEOS, async (_: Request, res: Response) => {
    try {
      const response = await prisma.videos.findMany({ orderBy: { upload_date: 'asc' } });
      res.json({ response });
    } catch {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
    }
  });

  app.get(ROUTES.TEST, async (_: Request, res: Response) => {
    try {
      // create folder in s3
      /*       const params = {
        Bucket: 'mys3bucket-upload-videos',
        Key: 'new-folder/',
        ACL: 'public-read',
      };

      s3.putObject(params, () => {
        res.json({});
      });
 */
      ffmpeg('src/tmp/crazy.mp4')
        .audioCodec('libopus')
        .audioBitrate(96)
        .outputOptions([
          '-codec: copy',
          '-hls_time 10',
          '-hls_playlist_type vod',
          '-hls_base_url https://mys3bucket-upload-videos.s3.amazonaws.com/new-folder/',
          '-hls_segment_filename src/tmp/%03d.ts',
        ])
        .output('src/tmp/crazy.m3u8')
        .on('progress', function (progress: any) {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .on('end', function (err: any, stdout: any, stderr: any) {
          console.log('Finished processing!', err, stdout, stderr);
        })
        .on('error', (err: any) => console.log('err' + err))
        .run();
      /*       const filePath = '../tmp/crazy.m3u8';

      fs.readFile(filePath, function (error, content) {
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
        console.log(content);
        if (error) {
          if (error.code == 'ENOENT') {
            fs.readFile('./404.html', function (error, content) {
              res.end(content, 'utf-8');
            });
          } else {
            res.writeHead(500);
            res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            res.end();
          }
        } else {
          res.end(content, 'utf-8');
        }
      }); */
    } catch {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
    }
  });
};
