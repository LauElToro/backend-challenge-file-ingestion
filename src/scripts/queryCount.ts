import 'reflect-metadata';
import { SqlServerService } from '../services/sqlserver.service';

(async () => {
  const db = new SqlServerService();
  await db.connect();

  const pool = db.getPool();
  const result = await pool.request().query('SELECT COUNT(*) as total FROM Clientes');

  console.log(`📊 Total de registros en la tabla Clientes: ${result.recordset[0].total}`);

  await pool.close();
})();
