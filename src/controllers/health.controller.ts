import { FastifyInstance } from 'fastify';
import { injectable } from 'inversify';

@injectable()
export class HealthController {
  async register(server: FastifyInstance) {
    server.get('/health', async () => {
      return { status: 'ok' };
    });
  }
}