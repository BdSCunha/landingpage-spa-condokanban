/**
 * Firebase Cloud Functions para CondoKanban
 * API segura para captura de leads sem expor credenciais
 */

import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Inicializa Firebase Admin (usa credenciais automáticas do ambiente)
initializeApp();
const db = getFirestore();

/**
 * API endpoint para salvar leads
 * POST /api/leads
 * 
 * Body: {
 *   name: string,
 *   email: string,
 *   phone: string,
 *   source: string,
 *   userAgent: string,
 *   url: string,
 *   timestamp: string
 * }
 */
export const leads = onRequest(
  {
    cors: true, // Habilita CORS para seu domínio
    region: "us-central1"
  },
  async (req, res) => {
    // Apenas POST é permitido
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const {
        name,
        email,
        phone,
        source,
        userAgent,
        url,
        timestamp
      } = req.body;

      // Validações básicas
      if (!name || !email || !phone) {
        res.status(400).json({
          error: "Campos obrigatórios faltando",
          required: ["name", "email", "phone"]
        });
        return;
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Email inválido" });
        return;
      }

      // Validação de telefone brasileiro
      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        res.status(400).json({ error: "Telefone brasileiro inválido" });
        return;
      }

      // Salvar no Firestore
      const leadData = {
        name,
        email,
        phone,
        source: source || "landing-page",
        userAgent: userAgent || req.headers["user-agent"],
        url: url || "unknown",
        ip: req.ip,
        timestamp: timestamp || new Date().toISOString(),
        createdAt: new Date()
      };

      const docRef = await db.collection("leads").add(leadData);

      // Log de sucesso
      console.log(`Lead capturado: ${docRef.id} - ${email}`);

      res.status(201).json({
        success: true,
        message: "Lead cadastrado com sucesso",
        id: docRef.id
      });
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        message: error.message
      });
    }
  }
);
