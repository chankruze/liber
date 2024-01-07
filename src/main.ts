import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //  filter out properties that should not be received by the method handler
      transform: true, // transform payloads to be objects typed according to their DTO classes
    }),
  );
  await app.listen(3000, '0.0.0.0'); // specify '0.0.0.0' in the listen() for all hosts
}

bootstrap();

// Docs //

// (ValidationPipe)
// |-(stripping properties): https://docs.nestjs.com/techniques/validation#stripping-properties
// |-(transform payloads): https://docs.nestjs.com/techniques/validation#transform-payload-objects

// (fastify): https://docs.nestjs.com/techniques/performance
// |-(middlewares) https://fastify.dev/docs/latest/Reference/Middleware/
