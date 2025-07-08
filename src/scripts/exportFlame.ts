import fs from 'fs';
import path from 'path';

const CLINIC_DIR = '/app/.clinic';
const TMP_B64_PATH = '/tmp/clinic-report.b64';

function getLatestClinicFile(): string | null {
  const files = fs.readdirSync(CLINIC_DIR).filter(f => f.endsWith('.clinic-flame.html'));
  if (files.length === 0) return null;

  const sorted = files.map(f => ({
    name: f,
    time: fs.statSync(path.join(CLINIC_DIR, f)).mtime.getTime()
  })).sort((a, b) => b.time - a.time);

  return path.join(CLINIC_DIR, sorted[0].name);
}

function encodeToBase64(filePath: string, outputPath: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');
  fs.writeFileSync(outputPath, base64);
  console.log(`✅ Archivo codificado: ${outputPath}`);
  console.log('👇 Copia este contenido y decodifica en tu máquina:');
  console.log(base64);
}

const flameFile = getLatestClinicFile();
if (!flameFile) {
  console.error('❌ No se encontró ningún archivo .clinic-flame.html');
  process.exit(1);
}

encodeToBase64(flameFile, TMP_B64_PATH);
