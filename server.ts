import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Configurar límites amplios para archivos de informes médicos extensos
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Directorio de persistencia en el servidor
const STORAGE_DIR = path.join(process.cwd(), "storage");
const URGENCIAS_FILE = path.join(STORAGE_DIR, "urgencias_report_203.json");
const CONSULTAS_FILE = path.join(STORAGE_DIR, "consultas_pym_report.json");

if (!fs.existsSync(STORAGE_DIR)) {
  try {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  } catch (err) {
    console.error("Error al crear carpeta storage:", err);
  }
}

// ========================================================
// API RUTAS PARA SINCRONIZACIÓN MULTI-DISPOSITIVO
// ========================================================

// Endpoint de estado y sincronización rápida
app.get("/api/reports/status", (req, res) => {
  try {
    let urgenciasMeta = null;
    let consultasMeta = null;

    if (fs.existsSync(URGENCIAS_FILE)) {
      const stat = fs.statSync(URGENCIAS_FILE);
      urgenciasMeta = {
        updatedAt: stat.mtime.toISOString(),
        size: stat.size
      };
    }

    if (fs.existsSync(CONSULTAS_FILE)) {
      const stat = fs.statSync(CONSULTAS_FILE);
      consultasMeta = {
        updatedAt: stat.mtime.toISOString(),
        size: stat.size
      };
    }

    res.json({
      status: "ok",
      serverTime: new Date().toISOString(),
      hasUrgencias: !!urgenciasMeta,
      urgenciasMeta,
      hasConsultas: !!consultasMeta,
      consultasMeta
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Error al verificar estado" });
  }
});

// URGENCIAS 203: Obtener reporte guardado en el servidor
app.get("/api/reports/urgencias", (req, res) => {
  try {
    if (!fs.existsSync(URGENCIAS_FILE)) {
      return res.json({ data: null, message: "No hay reporte de urgencias en el servidor" });
    }

    const content = fs.readFileSync(URGENCIAS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return res.json({ data: parsed, serverSync: true });
  } catch (err: any) {
    console.error("Error al leer urgencias en el servidor:", err);
    return res.status(500).json({ error: "Error al leer archivo de urgencias del servidor" });
  }
});

// URGENCIAS 203: Guardar / reemplazar reporte en el servidor (disponible para todos los dispositivos)
app.post("/api/reports/urgencias", (req, res) => {
  try {
    const { summary, fileName } = req.body;
    if (!summary) {
      return res.status(400).json({ error: "Faltan datos del resumen de urgencias" });
    }

    const payload = {
      summary,
      fileName: fileName || "Reporte_203_Urgencias.xlsx",
      savedAt: new Date().toISOString()
    };

    fs.writeFileSync(URGENCIAS_FILE, JSON.stringify(payload), "utf-8");
    console.log(`[Servidor] Reporte de urgencias guardado exitosamente: ${payload.fileName}`);
    return res.json({ success: true, savedAt: payload.savedAt, fileName: payload.fileName });
  } catch (err: any) {
    console.error("Error al guardar reporte de urgencias en el servidor:", err);
    return res.status(500).json({ error: "Error al guardar reporte de urgencias en el servidor" });
  }
});

// URGENCIAS 203: Eliminar reporte del servidor
app.delete("/api/reports/urgencias", (req, res) => {
  try {
    if (fs.existsSync(URGENCIAS_FILE)) {
      fs.unlinkSync(URGENCIAS_FILE);
      console.log("[Servidor] Reporte de urgencias eliminado del servidor");
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error("Error al eliminar urgencias en el servidor:", err);
    return res.status(500).json({ error: "Error al eliminar archivo del servidor" });
  }
});

// CONSULTAS & PYM: Obtener reporte guardado en el servidor
app.get("/api/reports/consultas", (req, res) => {
  try {
    if (!fs.existsSync(CONSULTAS_FILE)) {
      return res.json({ data: null, message: "No hay reporte de consultas en el servidor" });
    }

    const content = fs.readFileSync(CONSULTAS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return res.json({ data: parsed, serverSync: true });
  } catch (err: any) {
    console.error("Error al leer consultas en el servidor:", err);
    return res.status(500).json({ error: "Error al leer archivo de consultas del servidor" });
  }
});

// CONSULTAS & PYM: Guardar / reemplazar reporte en el servidor (disponible para todos los dispositivos)
app.post("/api/reports/consultas", (req, res) => {
  try {
    const { consultations, fileName } = req.body;
    if (!consultations || !Array.isArray(consultations)) {
      return res.status(400).json({ error: "Faltan las consultas en formato de lista" });
    }

    const payload = {
      consultations,
      fileName: fileName || "Reporte_Consultas_PyM.xlsx",
      savedAt: new Date().toISOString()
    };

    fs.writeFileSync(CONSULTAS_FILE, JSON.stringify(payload), "utf-8");
    console.log(`[Servidor] Reporte de consultas guardado exitosamente: ${payload.fileName} (${consultations.length} filas)`);
    return res.json({ success: true, savedAt: payload.savedAt, fileName: payload.fileName });
  } catch (err: any) {
    console.error("Error al guardar reporte de consultas en el servidor:", err);
    return res.status(500).json({ error: "Error al guardar reporte de consultas en el servidor" });
  }
});

// CONSULTAS & PYM: Eliminar reporte del servidor
app.delete("/api/reports/consultas", (req, res) => {
  try {
    if (fs.existsSync(CONSULTAS_FILE)) {
      fs.unlinkSync(CONSULTAS_FILE);
      console.log("[Servidor] Reporte de consultas eliminado del servidor");
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error("Error al eliminar consultas en el servidor:", err);
    return res.status(500).json({ error: "Error al eliminar archivo del servidor" });
  }
});

// ========================================================
// INTEGRACIÓN CON VITE (DEV) Y ARCHIVOS ESTÁTICOS (PROD)
// ========================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor Hospital Santa Teresa activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
