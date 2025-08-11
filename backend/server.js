import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  GoogleGenAI,
  Type,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";
import mime from "mime";
import { writeFile } from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const config = {
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
};

// Generate Habits
app.post("/api/generate-habits", async (req, res) => {
  try {
    const { promptText } = req.body;

    const SYSTEM_INSTRUCTION = `You are a habit planner assistant. The user will share their name, daily routine, and personal challenges.
Your task:
1. Suggest up to 8 daily habits that are genuinely useful for the user's goals and situation.
2. Only include habits that add value — you are not required to always give 8; give fewer if that's what the user truly needs.
3. Each habit must be short (under 10 words) and specify a clear time or quantity.
4. Do not include existing fixed commitments (work, school, university, bootcamp) as habits. Instead, suggest complementary habits that fit around them.
5. If the user's information reveals direct or implied challenges (e.g., sedentary lifestyle, stress, poor diet), include habits that address them.
6. Include one single Note that applies to all habits. The note should be motivating and, when appropriate, include compassionate exceptions.
7. Output must strictly follow this JSON schema: { "Note": "string", "Habits": ["string", "string", ...] }
Tone: friendly, encouraging, realistic.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: {
        ...config,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            Note: { type: Type.STRING },
            Habits: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["Note", "Habits"],
        },
      },
    });

    const result = parseGeminiResponse(response.text);
    res.json(result);
  } catch (error) {
    console.error("Error generating habits:", error);
    res.status(500).json({ error: "Failed to generate habits" });
  }
});

// Generate Weekly Planner
app.post("/api/generate-weekly", async (req, res) => {
  try {
    const { promptText } = req.body;

    const SYSTEM_INSTRUCTION = `You are a weekly goal planner assistant. The user will provide their upcoming week's context.
Task:
1. Produce JSON with: WeekOf, Health & Fitness, Career & Work, Personal Growth, Relationships, Finance, Weekly Reflection.
2. First five categories have 'Goal' and exactly 3 'ActionSteps'.
3. Weekly Reflection has 'WhatWentWell' and 'WhatCouldBeImproved'.
4. Make goals realistic, measurable, tailored to the user's life.
Output must follow the responseSchema exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: {
        ...config,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            WeekOf: { type: Type.STRING },
            HealthAndFitness: {
              type: Type.OBJECT,
              properties: {
                Goal: { type: Type.STRING },
                ActionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["Goal", "ActionSteps"],
            },
            CareerAndWork: {
              type: Type.OBJECT,
              properties: {
                Goal: { type: Type.STRING },
                ActionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["Goal", "ActionSteps"],
            },
            PersonalGrowth: {
              type: Type.OBJECT,
              properties: {
                Goal: { type: Type.STRING },
                ActionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["Goal", "ActionSteps"],
            },
            Relationships: {
              type: Type.OBJECT,
              properties: {
                Goal: { type: Type.STRING },
                ActionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["Goal", "ActionSteps"],
            },
            Finance: {
              type: Type.OBJECT,
              properties: {
                Goal: { type: Type.STRING },
                ActionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["Goal", "ActionSteps"],
            },
            WeeklyReflection: {
              type: Type.OBJECT,
              properties: {
                WhatWentWell: { type: Type.STRING },
                WhatCouldBeImproved: { type: Type.STRING },
              },
              required: ["WhatWentWell", "WhatCouldBeImproved"],
            },
          },
          required: [
            "WeekOf",
            "HealthAndFitness",
            "CareerAndWork",
            "PersonalGrowth",
            "Relationships",
            "Finance",
            "WeeklyReflection",
          ],
        },
      },
    });

    const result = parseGeminiResponse(response.text);
    res.json(result);
  } catch (error) {
    console.error("Error generating weekly planner:", error);
    res.status(500).json({ error: "Failed to generate weekly planner" });
  }
});

// Generate Monthly Review
app.post("/api/generate-monthly", async (req, res) => {
  try {
    const { promptText } = req.body;

    const SYSTEM_INSTRUCTION = `You are a monthly review assistant. Based on the user's context:
1. Return GoalsCompleted and GoalsInProgress (≤ 20 words each).
2. Reflection with: Where, BiggestWins, ChallengesAndHowOvercame, WhatILearnedAboutMyself (≤ 35 words each).
3. TopPriorities: exactly 3 priorities (≤ 8 words each).
4. FocusHabits: exactly 3 habits (≤ 8 words each).
5. Output must strictly follow the provided JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: {
        ...config,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            GoalsCompleted: { type: Type.STRING },
            GoalsInProgress: { type: Type.STRING },
            Reflection: {
              type: Type.OBJECT,
              properties: {
                Where: { type: Type.STRING },
                BiggestWins: { type: Type.STRING },
                ChallengesAndHowOvercame: { type: Type.STRING },
                WhatILearnedAboutMyself: { type: Type.STRING },
              },
              required: [
                "BiggestWins",
                "ChallengesAndHowOvercame",
                "WhatILearnedAboutMyself",
              ],
            },
            TopPriorities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 3,
              maxItems: 3,
            },
            FocusHabits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: [
            "GoalsCompleted",
            "GoalsInProgress",
            "Reflection",
            "TopPriorities",
            "FocusHabits",
          ],
        },
      },
    });

    const result = parseGeminiResponse(response.text);
    res.json(result);
  } catch (error) {
    console.error("Error generating monthly review:", error);
    res.status(500).json({ error: "Failed to generate monthly review" });
  }
});

// Generate Podcast Transcript
app.post("/api/generate-podcast", async (req, res) => {
  try {
    const { userName, firstPrompt, habits, weekly, monthly } = req.body;

    const podcastConfig = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["Transcript"],
        properties: {
          Transcript: {
            type: Type.STRING,
            description:
              "Full podcast transcript in English with alternating lines labeled 'Speaker 1:' and 'Speaker 2:' (plain text, no markdown formatting). Must begin with \"Hi, we're Skill Boost…\" and address the user by name.",
          },
          Title: {
            type: Type.STRING,
            description: "Optional short title for the episode.",
          },
        },
      },
      systemInstruction: [
        {
          text: `
You are a podcast scriptwriter for **Skill Boost**.
You will receive user context:

* \`userName\` (string)
* \`firstPrompt\` (free text from the user)
* \`habits\` (JSON with: Note, Habits[])
* \`weekly\` (Weekly Goal Planner JSON)
* \`monthly\` (Monthly Review JSON with GoalsCompleted, GoalsInProgress, Reflection, TopPriorities, FocusHabits)

Your task:

1. Write a **motivational podcast transcript in English** with **two speakers** (Speaker 1 and Speaker 2).
2. **Start with**: "Hi, we're Skill Boost…" and explicitly address the user by name (e.g., "this episode is for {userName}").
3. Tone: warm, empathetic, optimistic, high-energy; focused on real progress, effort, and resilience.
4. Personalize using concrete details from \`habits\`, \`weekly\`, and \`monthly\` (mention habits, goals, wins, challenges, and learnings).
5. Structure as continuous prose (no lists).
   Include: brief intro, acknowledgment of starting point and progress, recap of wins and helpful habits, empathetic note on challenges and how they were/are being overcome, reinforcement of priorities and focus habits for the next stage, and an inspiring closing with a call to action.
6. **Transcript format**: alternate lines labeled exactly as:
   Speaker 1: …
   Speaker 2: …
   (Do not use markdown formatting like ** or bold text)
7. Target length: **400-700 words**.
8. Use clear, natural, conversational English; avoid jargon. Do not invent facts outside the provided context.
9. Output **only** the final transcript with speaker labels (no extra metadata).
`,
        },
      ],
    };

    const inputData = JSON.stringify({
      userName,
      firstPrompt,
      habits,
      weekly,
      monthly,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      config: podcastConfig,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: inputData,
            },
          ],
        },
      ],
    });

    const result = parseGeminiResponse(response.text);
    res.json(result);
  } catch (error) {
    console.error("Error generating podcast transcript:", error);
    res.status(500).json({ error: "Failed to generate podcast transcript" });
  }
});

// Generate Podcast Audio
app.post("/api/generate-podcast-audio", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const audioConfig = {
      temperature: 1,
      responseModalities: ["audio"],
      speech_config: {
        multi_speaker_voice_config: {
          speaker_voice_configs: [
            {
              speaker: "Speaker 1",
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: "Zephyr",
                },
              },
            },
            {
              speaker: "Speaker 2",
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: "Puck",
                },
              },
            },
          ],
        },
      },
    };

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-pro-preview-tts",
      config: audioConfig,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: transcript,
            },
          ],
        },
      ],
    });

    let audioBuffer = null;
    let fileIndex = 0;

    for await (const chunk of response) {
      if (
        !chunk.candidates ||
        !chunk.candidates[0].content ||
        !chunk.candidates[0].content.parts
      ) {
        continue;
      }

      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const fileName = `podcast_${Date.now()}_${fileIndex++}`;
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        let fileExtension = mime.getExtension(inlineData.mimeType || "");
        let buffer = Buffer.from(inlineData.data || "", "base64");

        if (!fileExtension) {
          fileExtension = "wav";
          buffer = convertToWav(
            inlineData.data || "",
            inlineData.mimeType || ""
          );
        }

        const fullFileName = `${fileName}.${fileExtension}`;
        saveBinaryFile(fullFileName, buffer);
        audioBuffer = buffer;
      }
    }

    if (audioBuffer) {
      res.set({
        "Content-Type": "audio/wav",
        "Content-Disposition": 'attachment; filename="podcast.wav"',
      });
      res.send(audioBuffer);
    } else {
      res.status(500).json({ error: "No audio generated" });
    }
  } catch (error) {
    console.error("Error generating podcast audio:", error);
    res.status(500).json({ error: "Failed to generate podcast audio" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "SkillBoost Backend is running" });
});

// Helper function to parse JSON from Gemini response
function parseGeminiResponse(responseText) {
  // Extract JSON from markdown code blocks if present
  if (responseText.includes("```json")) {
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      responseText = jsonMatch[1];
    }
  } else if (responseText.includes("```")) {
    const codeMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch) {
      responseText = codeMatch[1];
    }
  }

  return JSON.parse(responseText.trim());
}

// Helper functions for audio processing
function saveBinaryFile(fileName, content) {
  writeFile(fileName, content, "utf8", (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
      return;
    }
    console.log(`File ${fileName} saved to file system.`);
  });
}

function convertToWav(rawData, mimeType) {
  const options = parseMimeType(mimeType);
  const wavHeader = createWavHeader(rawData.length, options);
  const buffer = Buffer.from(rawData, "base64");
  return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType) {
  const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
  const [_, format] = fileType.split("/");

  const options = {
    numChannels: 1,
    sampleRate: 24000,
    bitsPerSample: 16,
  };

  if (format && format.startsWith("L")) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split("=").map((s) => s.trim());
    if (key === "rate") {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options;
}

function createWavHeader(dataLength, options) {
  const { numChannels, sampleRate, bitsPerSample } = options;

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write("RIFF", 0); // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
  buffer.write("WAVE", 8); // Format
  buffer.write("fmt ", 12); // Subchunk1ID
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(byteRate, 28); // ByteRate
  buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
  buffer.write("data", 36); // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

  return buffer;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
