import { buildServer } from "./app";

const start = async () => {
  const server = buildServer();

  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Servidor iniciado en http://localhost:3000');
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

start();
