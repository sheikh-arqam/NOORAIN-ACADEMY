import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoints
  app.post("/api/ai/ask", async (req, res) => {
    try {
      const { prompt, subject } = req.body;
      const systemInstruction = `You are an expert, respectful, and encouraging AI Islamic Studies & Arabic Tutor for Banat (female students) in an Islamic institute platform called Al-Hikmah. You provide accurate, traditional, sound Islamic knowledge (Quranic Tafsir, Hadith, Fiqh, Aqeedah, Arabic Grammar, Tajweed) with scholarly wisdom, clear explanations, and respectful decorum. Subject context: ${subject || 'General'}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      res.json({ text: response.text || "No response generated." });
    } catch (error: any) {
      console.error("AI Ask Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  app.post("/api/ai/quiz", async (req, res) => {
    try {
      const { topic, count = 3 } = req.body;
      const systemInstruction = `Generate a JSON array of ${count} multiple-choice questions for Islamic studies topic: "${topic}". Each object must have fields: question (string), options (array of 4 strings), correctAnswer (string), and explanation (string). Return valid JSON only.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Create quiz questions on ${topic}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });
      
      const jsonText = response.text || "[]";
      let questions = [];
      try {
        questions = JSON.parse(jsonText);
      } catch {
        questions = [];
      }
      res.json({ questions });
    } catch (error: any) {
      console.error("AI Quiz Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz" });
    }
  });

  // Vite middleware for development or static serving for production
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
