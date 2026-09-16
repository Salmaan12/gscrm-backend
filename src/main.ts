import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';

import { AppModule } from './app.module';
import morgan = require('morgan');

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const sslEnabled = process.env.SSL_ENABLED === 'true';

  const httpsOptions = sslEnabled
    ? {
        key: readFileSync(process.env.SSL_KEY_PATH!),
        cert: readFileSync(process.env.SSL_CERT_PATH!),
      }
    : undefined;

  const app = await NestFactory.create(AppModule, {
    ...(httpsOptions && { httpsOptions }),
  });

  app.use(morgan('combined'));
  app.enableCors({origin: '*'});
  app.setGlobalPrefix('api/v1');
  
  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  const protocol = sslEnabled ? 'https' : 'http';

  logger.log(`Server running on ${protocol}://localhost:${port}`);
}

bootstrap();