import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { inject, injectable } from 'inversify';
import { SqlServerService } from './sqlserver.service';

const CHECKPOINT_FILE = path.resolve(__dirname, '../checkpoint.json');

@injectable()
export class FileProcessorService {
  private readonly BATCH_SIZE = 500;
  private readonly MAX_RETRIES = 3;

  constructor(@inject('SqlServerService') private db: SqlServerService) {}

  private async withRetries<T>(fn: () => Promise<T>, retries: number): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err: any) {
        attempt++;
        if (err.code === 'ECONNCLOSED') {
          console.warn('🔄 Reconectando a SQL Server...');
          await this.db.connect();
        }
        if (attempt > retries) throw err;
        console.warn(`⚠️ Reintento ${attempt} fallido. Esperando ${attempt ** 2}s...`);
        await new Promise(res => setTimeout(res, attempt ** 2 * 1000));
      }
    }
  }

  private loadCheckpoint(): number {
    try {
      if (fs.existsSync(CHECKPOINT_FILE)) {
        const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
        return data.lastLine ?? 0;
      }
    } catch {
      console.warn('⚠️ Error al leer checkpoint. Iniciando desde línea 0.');
    }
    return 0;
  }

  private saveCheckpoint(line: number) {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastLine: line }), 'utf-8');
  }

  async processFile(filePath: string): Promise<{ lines: number; failed: number }> {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE); // reset en test
    }

    await this.withRetries(() => this.db.connect(), this.MAX_RETRIES);

    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    const startFrom = this.loadCheckpoint();
    let batch: string[][] = [];
    let totalLines = 0;
    let failed = 0;
    let currentLine = 0;
    const errores: { linea: number; contenido: string; motivos: string[] }[] = [];

    for await (const line of rl) {
      currentLine++;
      if (currentLine <= startFrom) continue;

      const motivos: string[] = [];
      try {
        let parts = line.trim().split('|');

        if (parts.length > 7) {
          const [nombre, apellido, ...rest] = parts;
          const expectedTail = rest.slice(-5);
          const joinedApellido = [apellido, ...rest.slice(0, rest.length - 5)].join(' ');
          parts = [nombre, joinedApellido, ...expectedTail];
        }

        if (parts.length !== 7) {
          motivos.push('Cantidad de columnas inválida');
        } else {
          let [nombre, apellido, dni, estado, fechaIngreso, esPep, esSujetoObligado] = parts.map(p => p.trim());

          if (!nombre || !apellido || !dni || !estado || !fechaIngreso) {
            motivos.push('Campos obligatorios faltantes');
          }

          if (nombre.length > 20) motivos.push('Nombre supera los 20 caracteres');
          if (apellido.length > 20) motivos.push('Apellido supera los 20 caracteres');
          if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaIngreso)) {
            motivos.push('Fecha inválida o con formato incorrecto');
          }

          if (esPep !== 'true' && esPep !== 'false') {
            motivos.push('Valor inválido para EsPEP');
          }

          if (esSujetoObligado !== 'true' && esSujetoObligado !== 'false') {
            motivos.push('Valor inválido para EsSujetoObligado');
          }

          if (motivos.length === 0) {
            batch.push([
              nombre,
              apellido,
              dni.slice(0, 20),
              estado.slice(0, 50),
              fechaIngreso.slice(0, 50),
              esPep,
              esSujetoObligado
            ]);
            totalLines++;
          }
        }

        if (motivos.length > 0) {
          errores.push({ linea: currentLine, contenido: line, motivos });
          failed++;
        }

        if (batch.length >= this.BATCH_SIZE) {
          await this.withRetries(() => this.db.insertBatch(batch), this.MAX_RETRIES);
          this.saveCheckpoint(currentLine);
          batch = [];
        }
      } catch (err) {
        errores.push({ linea: currentLine, contenido: line, motivos: [`Error inesperado: ${(err as Error).message}`] });
        console.error(`❌ Línea inválida ${currentLine}:`, err);
        failed++;
      }
    }

    if (batch.length > 0) {
      try {
        await this.withRetries(() => this.db.insertBatch(batch), this.MAX_RETRIES);
        this.saveCheckpoint(currentLine);
      } catch (err) {
        console.error('❌ Error al insertar el último batch:', err);
      }
    }

    if (errores.length > 0) {
      const erroresPath = path.resolve(__dirname, '../errores.json');
      fs.writeFileSync(erroresPath, JSON.stringify(errores, null, 2), 'utf-8');
      console.log(`⚠️ Se registraron ${errores.length} errores en: errores.json`);
    }

    return { lines: totalLines, failed };
  }
}