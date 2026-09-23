import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Urgencias203Summary, NormalizedConsultation } from './types';

// Inicializar Firebase App
export const app = initializeApp(firebaseConfig);

// Inicializar Firestore con el ID de base de datos específico provisionado
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validar conexión a Firestore requerida por estándar de arquitectura
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Conexión institucional verificada con éxito.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Cliente en modo sin conexión o red restringida.');
    }
  }
}
testFirestoreConnection();

// Constantes de colección en Firestore
const DOC_URGENCIAS = 'urgencias_principal';
const DOC_CONSULTAS_META = 'consultas_principal';
const CHUNK_SIZE = 400; // 400 registros por bloque para alta velocidad y respetar límite de 1MB

// ========================================================
// SERVICIO EN NUBE: URGENCIAS REPORTE 203
// ========================================================

export async function saveCloudUrgencias(
  summary: Urgencias203Summary,
  fileName: string
): Promise<void> {
  const docRef = doc(db, 'urgencias_reports', DOC_URGENCIAS);
  const payload = {
    fileName,
    updatedAt: new Date().toISOString(),
    summaryJson: JSON.stringify(summary)
  };
  await setDoc(docRef, payload);
  console.log('[Firestore] Reporte de urgencias guardado en la base de datos:', fileName);
}

export async function loadCloudUrgencias(): Promise<{
  summary: Urgencias203Summary;
  fileName: string;
  savedAt: string;
} | null> {
  try {
    const docRef = doc(db, 'urgencias_reports', DOC_URGENCIAS);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    if (!data || !data.summaryJson) return null;

    return {
      summary: JSON.parse(data.summaryJson),
      fileName: data.fileName || 'Reporte_203_Urgencias.xlsx',
      savedAt: data.updatedAt || new Date().toISOString()
    };
  } catch (err) {
    console.warn('[Firestore] Error al leer urgencias de Firestore:', err);
    return null;
  }
}

export async function clearCloudUrgencias(): Promise<void> {
  try {
    const docRef = doc(db, 'urgencias_reports', DOC_URGENCIAS);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Error al limpiar urgencias:', err);
  }
}

// ========================================================
// SERVICIO EN NUBE: CONSULTAS & PYM
// ========================================================

export async function saveCloudConsultas(
  consultations: NormalizedConsultation[],
  fileName: string
): Promise<void> {
  const total = consultations.length;
  const totalChunks = Math.ceil(total / CHUNK_SIZE);
  const now = new Date().toISOString();

  // Guardar fragmentos por lotes
  const batch = writeBatch(db);

  for (let i = 0; i < totalChunks; i++) {
    const chunkRecords = consultations.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const chunkRef = doc(db, 'consultas_chunks', `chunk_${i}`);
    batch.set(chunkRef, {
      chunkIndex: i,
      recordsJson: JSON.stringify(chunkRecords),
      updatedAt: now
    });
  }

  // Guardar metadatos principales
  const metaRef = doc(db, 'consultas_meta', DOC_CONSULTAS_META);
  batch.set(metaRef, {
    fileName,
    totalRecords: total,
    totalChunks,
    updatedAt: now
  });

  await batch.commit();
  console.log(`[Firestore] Guardadas ${total} consultas en ${totalChunks} fragmentos.`);
}

export async function loadCloudConsultas(): Promise<{
  consultations: NormalizedConsultation[];
  fileName: string;
  savedAt: string;
} | null> {
  try {
    const metaRef = doc(db, 'consultas_meta', DOC_CONSULTAS_META);
    const metaSnap = await getDoc(metaRef);
    if (!metaSnap.exists()) return null;

    const meta = metaSnap.data();
    if (!meta || typeof meta.totalChunks !== 'number') return null;

    const totalChunks = meta.totalChunks;
    const allRecords: NormalizedConsultation[] = [];

    // Cargar fragmentos en orden
    for (let i = 0; i < totalChunks; i++) {
      const chunkRef = doc(db, 'consultas_chunks', `chunk_${i}`);
      const chunkSnap = await getDoc(chunkRef);
      if (chunkSnap.exists()) {
        const chunkData = chunkSnap.data();
        if (chunkData?.recordsJson) {
          const parsedChunk: NormalizedConsultation[] = JSON.parse(chunkData.recordsJson);
          allRecords.push(...parsedChunk);
        }
      }
    }

    if (allRecords.length === 0) return null;

    return {
      consultations: allRecords,
      fileName: meta.fileName || 'Reporte_Consultas.xlsx',
      savedAt: meta.updatedAt || new Date().toISOString()
    };
  } catch (err) {
    console.warn('[Firestore] Error al cargar consultas de Firestore:', err);
    return null;
  }
}

export async function clearCloudConsultas(): Promise<void> {
  try {
    const metaRef = doc(db, 'consultas_meta', DOC_CONSULTAS_META);
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const meta = metaSnap.data();
      const totalChunks = meta?.totalChunks || 0;
      const batch = writeBatch(db);
      for (let i = 0; i < totalChunks; i++) {
        batch.delete(doc(db, 'consultas_chunks', `chunk_${i}`));
      }
      batch.delete(metaRef);
      await batch.commit();
    }
  } catch (err) {
    console.warn('[Firestore] Error al eliminar consultas:', err);
  }
}

// ========================================================
// ESCUCHA EN TIEMPO REAL MULTI-DISPOSITIVO
// ========================================================

export function subscribeToCloudUrgencias(
  onUpdate: (data: { summary: Urgencias203Summary; fileName: string; savedAt: string } | null) => void
) {
  const docRef = doc(db, 'urgencias_reports', DOC_URGENCIAS);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data();
      if (data?.summaryJson) {
        try {
          onUpdate({
            summary: JSON.parse(data.summaryJson),
            fileName: data.fileName || 'Reporte_203_Urgencias.xlsx',
            savedAt: data.updatedAt || new Date().toISOString()
          });
        } catch (e) {
          console.error('[Firestore] Error al parsear urgencias en snapshot:', e);
        }
      }
    },
    (error) => {
      console.warn('[Firestore] Error en suscripción a urgencias:', error);
    }
  );
}

export function subscribeToCloudConsultasMeta(
  onUpdateMeta: (meta: { fileName: string; totalRecords: number; updatedAt: string } | null) => void
) {
  const metaRef = doc(db, 'consultas_meta', DOC_CONSULTAS_META);
  return onSnapshot(
    metaRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdateMeta(null);
        return;
      }
      const data = snap.data();
      if (data) {
        onUpdateMeta({
          fileName: data.fileName,
          totalRecords: data.totalRecords,
          updatedAt: data.updatedAt
        });
      }
    },
    (error) => {
      console.warn('[Firestore] Error en suscripción a metadatos de consultas:', error);
    }
  );
}
