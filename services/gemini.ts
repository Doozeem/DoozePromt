import { GoogleGenAI } from "@google/genai";
import { PromptStyle } from "../types";

// Helper untuk menunggu (delay)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getStyleInstructions = (style: PromptStyle): string => {
  switch (style) {
    case PromptStyle.MIDJOURNEY:
      return `
        **Target Gaya:** Midjourney v6.
        **Fokus:** Komposisi artistik, pencahayaan dramatis, tekstur, dan parameter kamera (--ar 16:9, --stylize).
        **Format:** Frasa deskriptif dipisahkan koma. Gunakan kata kunci estetika visual (contoh: "cinematic lighting", "photorealistic", "8k", "unreal engine 5 render").
        **PENTING:** Jangan sertakan timestamp di dalam prompt final. Buat satu prompt kohesif per adegan.
      `;
    case PromptStyle.RUNWAY:
      return `
        **Target Gaya:** Runway Gen-3 Alpha / Kling.
        **Fokus:** FISIKA dan PERGERAKAN KAMERA.
        **Wajib:** HARUS mendeskripsikan pergerakan kamera (contoh: "Kamera mengarah ke kanan", "Zoom lambat", "Drone tracking shot"). Jelaskan kecepatan gerakan dan interaksi fisik objek.
        **Format:** Paragraf naratif yang fokus pada perubahan waktu.
      `;
    case PromptStyle.STABLE_DIFFUSION:
      return `
        **Target Gaya:** Stable Diffusion / PonyXL.
        **Fokus:** Deskripsi berbasis Tag (Tag-based).
        **Format:** (subjek), (aksi), (lingkungan), (pencahayaan), (kamera), (quality tags). Gunakan format tagging Danbooru.
        Contoh: "1girl, running, cyberpunk city, neon lights, motion blur, masterpiece, best quality, 4k".
      `;
    case PromptStyle.JSON:
      return `
        **Target Gaya:** Struktur JSON.
        **Fokus:** Analisis data terstruktur untuk developer.
        **Format:** ARRAY JSON KETAT (Strict JSON Array).
        Struktur:
        [
          {
            "scene_id": 1,
            "time_range": "00:00 - 00:08",
            "title": "Judul Kreatif",
            "visual_description": "...",
            "camera_movement": "...",
            "mood": "...",
            "subjects": ["..."]
          }
        ]
      `;
    case PromptStyle.DESCRIPTIVE:
    default:
      return `
        **Target Gaya:** Deskripsi Video Umum.
        **Fokus:** Keseimbangan antara aksi, subjek, dan atmosfer.
        **Format:** Narasi detail standar dalam Bahasa Indonesia yang mengalir.
      `;
  }
};

export const analyzeVideoContent = async (file: File, style: PromptStyle = PromptStyle.DESCRIPTIVE, includeAudio: boolean = false): Promise<string> => {
  // Kita kembali ke 'gemini-2.0-flash' karena error sebelumnya adalah 429 (Quota), bukan 404 (Not Found).
  // Artinya modelnya ada, tapi kita terlalu ngebut.
  const modelId = 'gemini-2.0-flash';
  
  const videoPart = await fileToGenerativePart(file);
  const styleInstruction = getStyleInstructions(style);

  const outputFormatInstruction = style === PromptStyle.JSON 
    ? `**Format Output:** Kembalikan HANYA JSON valid. Keys English, Values Bahasa Indonesia.`
    : `**Format Output:** Gunakan Markdown. Judul adegan jelas. Tambahkan blok JSON "Builder" di akhir.`;

  const audioInstruction = includeAudio 
    ? `**AUDIO:** Analisis suara, mood musik, dan dialog.` 
    : `**VISUAL:** Fokus hanya pada visual.`;

  const prompt = `
    Role: Sutradara Film & AI Engineer.
    Task: Reverse-engineer video ini menjadi prompt AI.
    Language: Bahasa Indonesia.
    ${styleInstruction}
    ${audioInstruction}
    ${outputFormatInstruction}
    Analisis detail per 8 detik.
  `;

  // API Key disuntikkan langsung untuk keperluan testing (sesuai permintaan user)
  // Jika process.env.API_KEY kosong, gunakan key hardcoded.
  const rawApiKey = process.env.API_KEY || "AIzaSyB8qZKgxFOgH8poaNucUz5YZtFbhb-9sXo";
  const apiKeys = rawApiKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (apiKeys.length === 0) {
     throw new Error("API Key tidak ditemukan.");
  }

  let lastError: any = null;

  // Loop melalui setiap API Key yang tersedia
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    const ai = new GoogleGenAI({ apiKey });

    // RETRY LOGIC (Maksimal 3 kali percobaan per key)
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`Mengirim request dengan Key ${i+1} (Percobaan ${retryCount + 1})...`);
        
        const response = await ai.models.generateContent({
          model: modelId,
          contents: {
            parts: [videoPart, { text: prompt }]
          },
          config: { temperature: 0.7 }
        });

        if (!response.text) throw new Error("Respon kosong.");
        return response.text; // SUKSES!

      } catch (error: any) {
        // Cek apakah errornya karena KUOTA (429)
        const isQuotaError = error.message?.includes('429') || 
                             error.message?.includes('quota') || 
                             error.message?.includes('RESOURCE_EXHAUSTED');

        if (isQuotaError) {
          console.warn(`Kuota habis (429) pada Key ${i+1}.`);
          
          if (retryCount < maxRetries - 1) {
            // Jika masih ada kesempatan retry, TUNGGU 25 DETIK
            // (Error bilang 21 detik, kita bulatkan ke 25 biar aman)
            const waitTime = 25000; 
            console.log(`Menunggu ${waitTime/1000} detik sebelum mencoba lagi...`);
            await wait(waitTime);
            retryCount++;
            continue; // Ulangi loop while
          }
        }
        
        // Jika bukan error kuota, atau retry sudah habis, simpan error dan lanjut ke Key berikutnya (jika ada)
        lastError = error;
        break; // Keluar dari loop while, lanjut ke loop for (ganti key)
      }
    }
  }

  throw new Error(`Gagal menganalisis. ${lastError?.message || "Server sibuk, coba lagi nanti."}`);
};