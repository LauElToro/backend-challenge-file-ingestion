import sql from 'mssql';
import 'dotenv/config';
import { injectable } from 'inversify';

@injectable()
export class SqlServerService {
  private pool: sql.ConnectionPool | null = null;

  async connect() {
    if (!this.pool) {
      try {
        this.pool = await sql.connect({
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          server: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '1433', 10),
          database: process.env.DB_NAME,
          options: {
            trustServerCertificate: true,
            encrypt: false,
          },
          pool: {
            max: 20,
            min: 2,
            idleTimeoutMillis: 30000,
          },
        });
        console.log('✅ Conexión a SQL Server establecida');
      } catch (err: any) {
        console.error('❌ Error al conectar a SQL Server:', err.message);
        throw err;
      }
    }
  }

  getPool(): sql.ConnectionPool {
    if (!this.pool) {
      throw new Error('❌ Pool no inicializado. Llamá a connect() primero.');
    }
    return this.pool;
  }

  async insertBatch(rows: string[][]) {
    const pool = this.getPool();
    const table = new sql.Table('Clientes');
    table.create = false;

table.columns.add('Nombre', sql.VarChar(100));
table.columns.add('Apellido', sql.VarChar(100));
table.columns.add('DNI', sql.VarChar(20));
table.columns.add('Estado', sql.VarChar(20));
table.columns.add('FechaIngreso', sql.VarChar(20));
table.columns.add('EsPEP', sql.VarChar(10));
table.columns.add('EsSujetoObligado', sql.VarChar(10));

    for (const row of rows) {
      if (row.length === 7) {
        table.rows.add(...row);
      } else {
        console.warn('⚠️ Fila ignorada por formato inválido:', row);
      }
    }

    try {
      console.log(`📝 Insertando batch de ${rows.length} filas...`);
      await pool.request().bulk(table);
    } catch (err: any) {
      console.error('❌ Error al hacer bulk insert:', err.message);
      throw err;
    }
  }
}