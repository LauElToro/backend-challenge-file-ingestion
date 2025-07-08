# 🧪 Challenge Técnico – Desarrollador Backend (Node.js)

## 📘 Contexto

Estás trabajando en un microservicio backend desarrollado en **Node.js**. Este servicio corre dentro de un contenedor **Docker**, sobre un entorno **Kubernetes** con sistema operativo **Linux**.

El sistema recibe diariamente un archivo de gran tamaño (aproximadamente **1 GB**) con registros de clientes. Cada línea del archivo representa un registro separado. Tu objetivo es procesar este archivo y volcar los datos en una base de datos **SQL Server**.

---

## 🎯 Objetivo

Desarrollar una solución que:

1. Procese correctamente el contenido del archivo `CLIENTES_IN_0425.dat`.
2. Inserte los datos procesados en una tabla de SQL Server.
3. Exponga un endpoint HTTP `/health` que refleje que el servicio está operativo incluso durante el procesamiento.
4. Entregue una propuesta técnica que escale para archivos 5 veces más grandes.

---

## 📦 Entrega esperada

Debes entregar:

- Código fuente del servicio completo.
- Script SQL para crear la tabla de destino.
- Instrucciones claras de cómo ejecutar el servicio (puede ser con `docker-compose`, `Makefile`, etc.).
- Un documento (.md) con instrucciones para levantar la solución en un ambiente local.

---

## ⚙️ Condiciones del entorno

El servicio se ejecutará en un pod de Kubernetes con los siguientes recursos:

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

---

## 🚫 Reglas

- No se permite modificar la estructura del archivo ni preprocesarlo fuera del servicio.
- Deberás ser capaz de defender todo lo implementado durante la entrevista técnica.

---

## ✨ Extras implementados

- ✅ Tolerancia a errores en líneas corruptas.
- ✅ Generación de reporte de errores (`errores.json`) con motivos específicos por línea.
- ✅ Reintentos automáticos y reconexión a SQL Server.
- ✅ Inserción en batches de hasta 500 registros.
- ✅ Separación de responsabilidades (procesamiento, base de datos, validaciones).
- ✅ Sistema de checkpoint para continuar desde la última línea procesada.
- ✅ Escalabilidad horizontal sugerida con RabbitMQ (ver propuesta técnica).
- ✅ Logs informativos.

---

## 🧪 Generación del archivo de prueba

Este proyecto ya incluye un script que genera el archivo `CLIENTES_IN_0425.dat` con datos aleatorios, incluyendo un porcentaje de líneas con errores intencionales.

### ⚙️ Parámetros de generación (modificables)

Dentro del archivo `src/generateFile.ts` podés modificar estos valores:

```ts
const RECORDS = 100_000; // Cantidad total de líneas
const ERROR_RATE = 0.2; // 20% con errores intencionales
```

### ✅ Pasos para generar el archivo

```bash
npm install
npx ts-node src/scripts/generateFile.ts
```

El archivo se generará en:

```
challenge/input/CLIENTES_IN_0425.dat
```

### 📄 Formato del archivo

```
<nombre>|<apellido>|<dni>|<estado>|<fechaIngreso>|<esPep>|<esSujetoObligado>
```

Ejemplo:

```
María|Gómez|45678901|Activo|11/13/2021|true|false
Carlos|Pérez|32165498|Inactivo|99/99/9999||
```

---

## 🧩 Definición mínima esperada para la tabla en SQL Server

```sql
NombreCompleto NVARCHAR(100) NOT NULL,
DNI BIGINT  NOT NULL,
Estado VARCHAR(10) NOT NULL,
FechaIngreso DATE NOT NULL,
EsPEP BIT NOT NULL,
EsSujetoObligado BIT  NULL,
FechaCreacion DATETIME  NOT NULL
```

---

## 🐳 Levantar Docker y correr tests

### 1. Clonar el proyecto o descomprimir

```bash
git clone https://github.com/LauElToro/backend-challenge-file-ingestion
cd backend-challenge-file-ingestion
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Generar archivo de prueba

```bash
npx ts-node src/generateFile.ts
```

### 4. Levantar base de datos y entorno

```bash
docker compose up -d
```

### 5. Ejecutar los tests

```bash
npm run test:flow
```

### 6. Verificar resultados

```bash
npx ts-node src/scripts/queryCount.ts
```

### 7. Probar el endpoint `/health`

```bash
curl http://localhost:3000/health
```

---

## 🔁 Cómo entregar

1. Subiendo a un repositorio (GitHub público o privado).
2. Compartiendo un `.zip` con el código (sin el archivo `CLIENTES_IN_0425.dat`).