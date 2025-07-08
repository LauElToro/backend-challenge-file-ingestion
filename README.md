# Worldsys Backend Challenge

## 🧠 Descripción

Microservicio desarrollado en Node.js + Fastify, encargado de procesar archivos para insertar datos estructurados en una base de datos Microsoft SQL Server. Diseñado para ejecutarse en contenedores Docker, con un enfoque en rendimiento, escalabilidad, pruebas automatizadas y observabilidad.

---

## 📁 Estructura del Proyecto

```
.
├── src/                 # Código fuente
│   ├── config/          # Configuraciones y contenedores DI
│   ├── controllers/     # Controladores HTTP (Fastify routes)
│   ├── services/        # Servicios inyectables (DB, procesador de archivo)
│   ├── scripts/         # Scripts utilitarios (generateFile, queryCount)
│   ├──test/             # Pruebas unitarias e integradas
│   └── data/            # Carpeta compartida para los archivos .dat
├── .env                 # Variables de entorno (opcional)
├── Dockerfile           # Imagen del microservicio
├── docker-compose.yml   # Entorno completo con SQL Server
└── README.md
```

---

## 🧪 Flujo Automatizado Completo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Generar archivo de prueba (pequeño)

```bash
npm run generate:file
```

### 3. Ejecutar SQL Server y microservicio con Docker

```bash
docker-compose up --build
```

### 4. Verificar estado del microservicio

```bash
curl http://localhost:3000/health
```

---

## Probar archivo completo automáticamente

### Test end-to-end del procesamiento:

```bash
npm run test:flow        # Para archivo chico (1000 líneas)
npm run test:flow:large  # Para archivo grande (10.000 líneas)
```

Esto genera el archivo, compila, ejecuta el microservicio e inicia el procesamiento automáticamente.

---

## 🐳 Paso a paso con Docker

### 1. Construir contenedores e iniciar el entorno

```bash
docker-compose up --build
```

Esto levanta:
- El microservicio en Fastify.
- Una instancia de SQL Server con base `TestDB`.

### 2. Acceder al contenedor backend

```bash
docker-compose exec backend sh
```

Desde ahí podés correr scripts como:

- ✅ Generar archivo chico:
  ```bash
  npm run generate:file
  ```

- ✅ Generar archivo grande:
  ```bash
  npm run generate:largefile
  ```

- ✅ Procesar archivo generado:
  ```bash
  npx ts-node src/scripts/processFile.ts
  ```

- ✅ Verificar cantidad de registros:
  ```bash
  npx ts-node src/scripts/queryCount.ts
  ```

### 3. Testear desde el host (fuera del contenedor)

- ✅ Health check:
  ```bash
  curl http://localhost:3000/health
  ```

- ✅ Test automatizado completo:
  ```bash
  docker-compose exec backend npm run test:flow
  ```

---

## 📄 Variables de Entorno (.env)

```
DB_USER=sa
DB_PASSWORD=AFSTYWQ576123S!
DB_HOST=sqlserver
DB_PORT=1433
DB_NAME=ClientesDB
```

---

## SQL de Creación de Tabla

```sql
CREATE TABLE Clientes (
  Nombre VARCHAR(20),
  Apellido VARCHAR(20),
  DNI VARCHAR(20),
  Estado VARCHAR(50),
  FechaIngreso VARCHAR(50),
  EsPep VARCHAR(10),
  EsSujetoObligado VARCHAR(10)
);
```

---

## ✅ API Endpoint

* `GET /health`: Verifica si el servicio está activo.

  ```json
  { "status": "ok" }
  ```

---

## Análisis de Performance con Clinic.js

### Ejecutar flamegraph:

```bash
npm run analyze:flame:export
```

> Esto genera un archivo `.html` interactivo con el perfil de CPU y event loop del proceso.

---

### ⚙️ Estrategias aplicadas

* Procesamiento línea a línea vía `readline`.
* Uso de stream para evitar desbordes de memoria.
* Inserción por lotes (`batchSize = 500`) con `mssql.bulk`.
* Manejo de errores por línea sin detener la ejecución.

### ⚙️ Preparado para producción

* Fragmentación del archivo por bloques y procesamiento en paralelo.
* Adaptable a `worker_threads`, colas Kafka/RabbitMQ o cron jobs distribuidos.
* Compatible con `BULK INSERT` de SQL Server si se habilita.

### 🧪 Prueba realista con 10.000 de líneas

```bash
npm run generate:largefile
```

## 🧪 Testing

### Ejecutar pruebas unitarias:

```bash
npm run test
```

### Pruebas incluidas:

* ✅ Test de endpoint `/health`
* ✅ Test de flujo completo (generar archivo, procesar, insertar)

---

## 📌 Requisitos

* Docker & Docker Compose
* Node.js 18+
* Espacio en disco (mínimo 5GB para pruebas grandes)
* Microsoft SQL Server habilitado en contenedor

---

## 📬 Contacto

**Lautaro Figueroa**  
Desafío técnico completado para Worldsys  
GitHub: [github.com/LaElToro](https://github.com/LauElToro)