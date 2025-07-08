import { FastifyInstance } from 'fastify';
import { inject, injectable } from 'inversify';
import path from 'path';
import fs from 'fs';
import { FileProcessorService } from '../services/file-processor.service';

@injectable()
export class FileController {
  constructor(
    @inject('FileProcessorService') private fileProcessor: FileProcessorService
  ) {}

  async register(server: FastifyInstance) {
    server.post('/process-file', async (_request, reply) => {
      const filePath = path.resolve(__dirname, '../challenge/input/CLIENTES_IN_0425.dat');

      if (!fs.existsSync(filePath)) {
        return reply.status(400).send({
          error: 'Archivo no encontrado',
          path: filePath
        });
      }

      try {
        console.log(`📂 Procesando archivo en ${filePath}`);
        const result = await this.fileProcessor.processFile(filePath);

        return reply.send({
          message: '✅ Procesamiento finalizado',
          processed: result.lines,
          failed: result.failed
        });
      } catch (err: any) {
        console.error('❌ Error en procesamiento:', err);
        return reply.status(500).send({
          error: '❌ Error durante el procesamiento',
          message: err.message
        });
      }
    });
  }
}