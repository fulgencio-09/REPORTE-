import { Urgencias203Summary, NormalizedConsultation } from '../types';

const DB_NAME = 'HospitalSantaTeresaAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'medical_reports';

const KEY_URGENCIAS = 'urgencias_report_203';
const KEY_CONSULTAS = 'consultas_pym_report';

interface StoredUrgencias {
  summary: Urgencias203Summary;
  fileName: string;
  savedAt: string;
}

interface StoredConsultas {
  consultations: NormalizedConsultation[];
  fileName: string;
  savedAt: string;
}

// Helper to open IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este navegador'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Error al abrir la base de datos local'));
  });
}

// Generic get from IndexedDB
async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve((request.result as T) || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn(`[Storage] Error al leer ${key} desde IndexedDB, intentando localStorage:`, err);
    try {
      const fallback = localStorage.getItem(key);
      if (fallback) {
        return JSON.parse(fallback) as T;
      }
    } catch (lsErr) {
      console.error('[Storage] Error al leer desde localStorage fallback:', lsErr);
    }
    return null;
  }
}

// Generic put to IndexedDB
async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Guardar también un indicador ligero en localStorage para sincronización rápida
    try {
      localStorage.setItem(`${key}_meta`, JSON.stringify({
        hasData: true,
        updatedAt: new Date().toISOString()
      }));
    } catch {
      // Ignore localStorage quota issues for metadata
    }
  } catch (err) {
    console.warn(`[Storage] Error al guardar ${key} en IndexedDB, intentando localStorage:`, err);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (lsErr) {
      console.error('[Storage] Error al guardar en localStorage fallback:', lsErr);
      throw lsErr;
    }
  }
}

// Generic delete from IndexedDB
async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[Storage] Error al eliminar ${key} en IndexedDB:`, err);
  }

  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_meta`);
  } catch {
    // Ignore
  }
}

// ==========================================
// URGENCIAS REPORTE 203
// ==========================================

export async function saveLocalUrgencias(
  summary: Urgencias203Summary,
  fileName: string
): Promise<void> {
  const data: StoredUrgencias = {
    summary,
    fileName,
    savedAt: new Date().toISOString()
  };

  // 1. Guardar primero en el servidor web para que esté disponible en todos los dispositivos
  try {
    const res = await fetch('/api/reports/urgencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, fileName })
    });
    if (!res.ok) {
      console.warn('[Storage] Servidor respondió con código no exitoso al guardar urgencias:', res.status);
    }
  } catch (netErr) {
    console.warn('[Storage] No se pudo sincronizar urgencias con el servidor web (modo sin conexión):', netErr);
  }

  // 2. Guardar en almacenamiento local (IndexedDB) para acceso rápido y sin conexión
  await idbSet(KEY_URGENCIAS, data);
}

export async function loadLocalUrgencias(): Promise<StoredUrgencias | null> {
  // 1. Intentar cargar desde el servidor web (prioridad: datos compartidos entre dispositivos)
  try {
    const res = await fetch('/api/reports/urgencias');
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.summary) {
        // Actualizar caché local
        await idbSet(KEY_URGENCIAS, json.data);
        return json.data as StoredUrgencias;
      }
    }
  } catch (netErr) {
    console.warn('[Storage] Servidor no disponible, cargando urgencias desde almacenamiento local:', netErr);
  }

  // 2. Si el servidor no tiene datos o está inaccesible, leer de IndexedDB local
  return await idbGet<StoredUrgencias>(KEY_URGENCIAS);
}

export async function clearLocalUrgencias(): Promise<void> {
  // Eliminar en servidor
  try {
    await fetch('/api/reports/urgencias', { method: 'DELETE' });
  } catch (err) {
    console.warn('[Storage] Error al eliminar urgencias en servidor:', err);
  }

  // Eliminar en almacenamiento local
  await idbDelete(KEY_URGENCIAS);
}

// ==========================================
// CONSULTAS & PYM
// ==========================================

export async function saveLocalConsultas(
  consultations: NormalizedConsultation[],
  fileName: string
): Promise<void> {
  const data: StoredConsultas = {
    consultations,
    fileName,
    savedAt: new Date().toISOString()
  };

  // 1. Guardar en el servidor web centralizado para acceso multi-dispositivo
  try {
    const res = await fetch('/api/reports/consultas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultations, fileName })
    });
    if (!res.ok) {
      console.warn('[Storage] Servidor respondió con error al guardar consultas:', res.status);
    }
  } catch (netErr) {
    console.warn('[Storage] No se pudo sincronizar consultas con el servidor web:', netErr);
  }

  // 2. Guardar en almacenamiento local IndexedDB
  await idbSet(KEY_CONSULTAS, data);
}

export async function loadLocalConsultas(): Promise<StoredConsultas | null> {
  // 1. Intentar cargar del servidor web primero
  try {
    const res = await fetch('/api/reports/consultas');
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.consultations && json.data.consultations.length > 0) {
        // Actualizar caché local
        await idbSet(KEY_CONSULTAS, json.data);
        return json.data as StoredConsultas;
      }
    }
  } catch (netErr) {
    console.warn('[Storage] Servidor no disponible, cargando consultas de almacenamiento local:', netErr);
  }

  // 2. Fallback a IndexedDB local
  return await idbGet<StoredConsultas>(KEY_CONSULTAS);
}

export async function clearLocalConsultas(): Promise<void> {
  // Eliminar en servidor
  try {
    await fetch('/api/reports/consultas', { method: 'DELETE' });
  } catch (err) {
    console.warn('[Storage] Error al eliminar consultas en servidor:', err);
  }

  // Eliminar en almacenamiento local
  await idbDelete(KEY_CONSULTAS);
}

// Verificar cambios en el servidor para sincronizar otros dispositivos
export async function getServerSyncStatus(): Promise<{
  hasUrgencias: boolean;
  urgenciasMeta: { updatedAt: string } | null;
  hasConsultas: boolean;
  consultasMeta: { updatedAt: string } | null;
} | null> {
  try {
    const res = await fetch('/api/reports/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Modo offline silencioso
  }
  return null;
}
