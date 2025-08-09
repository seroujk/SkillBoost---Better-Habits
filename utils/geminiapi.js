const MODEL_ID = "gemini-2.5-flash-lite";
const GENERATE_CONTENT_API = "streamGenerateContent";
const GEMINI_API_KEY = "";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${encodeURIComponent(
  GEMINI_API_KEY
)}`;

const promptText =
  "I am Mateo. I study at university and work part-time. I sit for long hours and feel stressed. I want to improve my health and focus.";

async function generateHabits() {
  const SYSTEM_INSTRUCTION =
    'You are a habit planner assistant. The user will share their name, daily routine, and personal challenges. Your task is to: 1. Suggest up to 8 daily habits that are genuinely useful for the user’s goals and situation. 2. Only include habits that add value — you are not required to always give 8; give fewer if that’s what the user truly needs. 3. Each habit must be short (under 10 words) and specify a clear time or quantity (e.g., minutes, pages, cups, reps). 4. Do not include existing fixed commitments (work, school, university, bootcamp) as habits. Instead, suggest complementary habits that fit around them (e.g., “Review notes 20 minutes,” “Stretch for 5 minutes after work”). 5. If the user’s information reveals direct or implied challenges (e.g., sedentary lifestyle, stress, poor diet), include habits that address them, even if the user didn’t explicitly ask. 6. Include one single Note that applies to all habits. The note should be motivating and, when appropriate, include compassionate exceptions (e.g., “If you feel tired, it’s okay to rest and try again tomorrow”). 7. Output must strictly follow this JSON schema: { "Note": "string", "Habits": ["string", "string", ...] } Keep the tone friendly, encouraging, and realistic for daily life.';

  const body = {
    systemInstruction: {
      parts: [
        {
          text: SYSTEM_INSTRUCTION,
        },
      ],
    },
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          Note: {
            type: "string",
            description: "General note that applies to all habits",
          },
          Habits: {
            type: "array",
            description: "List of habits",
            items: { type: "string", description: "A habit to be evaluated" },
          },
        },
        required: ["Note", "Habits"],
      },
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const chunks = await res.json();

    const fullText = (Array.isArray(chunks) ? chunks : [chunks])
      .map((ch) => ch?.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .join("");

    const result = JSON.parse(fullText);

    console.log("Prompt usado:", promptText);
    console.log("Resultado parseado:", result);

    return result;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

async function generateWeeklyPlanner(promptText) {
  const SYSTEM_INSTRUCTION =
    "You are a weekly goal planner assistant. The user will provide information about their upcoming week, priorities, and context. Your task is to: 1) Produce a Weekly Goal Planner in JSON with categories: Health & Fitness, Career & Work, Personal Growth, Relationships, Finance, Weekly Reflection. 2) For the first five categories, include 'Goal' and 'ActionSteps' (exactly 3 steps). 3) In Weekly Reflection include 'WhatWentWell' and 'WhatCouldBeImproved'. 4) Add 'WeekOf' at the start (YYYY-MM-DD). 5) Make goals realistic, measurable, and tailored to the user's context. Output must strictly follow the provided responseSchema.";

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          WeekOf: {
            type: "string",
            description: "Start date of the week (YYYY-MM-DD)",
          },
          "Health & Fitness": {
            type: "object",
            properties: {
              Goal: { type: "string" },
              ActionSteps: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["Goal", "ActionSteps"],
          },
          "Career & Work": {
            type: "object",
            properties: {
              Goal: { type: "string" },
              ActionSteps: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["Goal", "ActionSteps"],
          },
          "Personal Growth": {
            type: "object",
            properties: {
              Goal: { type: "string" },
              ActionSteps: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["Goal", "ActionSteps"],
          },
          Relationships: {
            type: "object",
            properties: {
              Goal: { type: "string" },
              ActionSteps: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["Goal", "ActionSteps"],
          },
          Finance: {
            type: "object",
            properties: {
              Goal: { type: "string" },
              ActionSteps: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["Goal", "ActionSteps"],
          },
          "Weekly Reflection": {
            type: "object",
            properties: {
              WhatWentWell: { type: "string" },
              WhatCouldBeImproved: { type: "string" },
            },
            required: ["WhatWentWell", "WhatCouldBeImproved"],
          },
        },
        required: [
          "WeekOf",
          "Health & Fitness",
          "Career & Work",
          "Personal Growth",
          "Relationships",
          "Finance",
          "Weekly Reflection",
        ],
      },
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const chunks = await res.json();

    const fullText = (Array.isArray(chunks) ? chunks : [chunks])
      .map((ch) => ch?.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .join("");

    const weeklyPlan = JSON.parse(fullText);

    console.log("Prompt usado:", promptText);
    console.log("Weekly plan:", weeklyPlan);

    return weeklyPlan;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}
