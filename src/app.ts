import 'reflect-metadata';
import fastify from 'fastify';
import { container } from './config/inversify.config';
import { HealthController } from './controllers/health.controller';
import { FileController } from './controllers/file.controller';

export const buildServer = () => {
  const server = fastify({ logger: true });

  const healthController = container.get<HealthController>('HealthController');
  const fileController = container.get<FileController>('FileController');

  server.register(healthController.register.bind(healthController));
  server.register(fileController.register.bind(fileController));

  return server;
};