const MODEL_ID = "gemini-2.5-flash-lite";
const GENERATE_CONTENT_API = "streamGenerateContent";
const GEMINI_API_KEY = "";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${encodeURIComponent(
  GEMINI_API_KEY
)}`;
const fs = require("fs");
const promptText =
  "I am Mateo. I study at university and work part-time. I sit for long hours and feel stressed. I want to improve my health and focus.";

async function generateHabits(promptText) {
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

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          Note: { type: "string" },
          Habits: { type: "array", items: { type: "string" } },
        },
        required: ["Note", "Habits"],
      },
    },
  };

  return await sendRequest(url, body);
}

async function generateWeeklyPlanner(promptText) {
  const SYSTEM_INSTRUCTION = `You are a weekly goal planner assistant. The user will provide their upcoming week's context.
Task:
1. Produce JSON with: WeekOf, Health & Fitness, Career & Work, Personal Growth, Relationships, Finance, Weekly Reflection.
2. First five categories have 'Goal' and exactly 3 'ActionSteps'.
3. Weekly Reflection has 'WhatWentWell' and 'WhatCouldBeImproved'.
4. Make goals realistic, measurable, tailored to the user's life.
Output must follow the responseSchema exactly.`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          WeekOf: { type: "string" },
          HealthAndFitness: {
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
          CareerAndWork: {
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
          PersonalGrowth: {
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
          WeeklyReflection: {
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
          "HealthAndFitness",
          "CareerAndWork",
          "PersonalGrowth",
          "Relationships",
          "Finance",
          "WeeklyReflection",
        ],
      },
    },
  };

  return await sendRequest(url, body);
}

async function generateMonthlyReview(promptText) {
  const SYSTEM_INSTRUCTION = `You are a monthly review assistant. Based on the user's context:
1. Return GoalsCompleted and GoalsInProgress (≤ 20 words each).
2. Reflection with: Where, BiggestWins, ChallengesAndHowOvercame, WhatILearnedAboutMyself (≤ 35 words each).
3. TopPriorities: exactly 3 priorities (≤ 8 words each).
4. FocusHabits: exactly 3 habits (≤ 8 words each).
5. Output must strictly follow the provided JSON schema.`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          GoalsCompleted: { type: "string", maxLength: 100 },
          GoalsInProgress: { type: "string", maxLength: 100 },
          Reflection: {
            type: "object",
            properties: {
              Where: { type: "string", maxLength: 35 },
              BiggestWins: { type: "string", maxLength: 35 },
              ChallengesAndHowOvercame: { type: "string", maxLength: 35 },
              WhatILearnedAboutMyself: { type: "string", maxLength: 35 },
            },
            required: [
              "BiggestWins",
              "ChallengesAndHowOvercame",
              "WhatILearnedAboutMyself",
            ],
          },
          TopPriorities: {
            type: "array",
            items: { type: "string", maxLength: 8 },
            minItems: 3,
            maxItems: 3,
          },
          FocusHabits: {
            type: "array",
            items: { type: "string", maxLength: 8 },
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
  };

  return await sendRequest(url, body);
}

async function generatePodcastTranscript(promptText) {
  const SYSTEM_INSTRUCTION = `You are a podcast scriptwriter for Skill Boost.
You will receive:
- userName (string)
- firstPrompt (text)
- habits (JSON with: Note, Habits[])
- weekly (Weekly Goal Planner JSON)
- monthly (Monthly Review JSON with GoalsCompleted, GoalsInProgress, Reflection, TopPriorities, FocusHabits)

Task:
1. Write a motivational podcast transcript in English with two speakers.
2. Start with: “Hi, we're Skill Boost…” and address the user by name.
3. Tone: warm, empathetic, optimistic, high-energy.
4. Personalize with real details from habits, weekly, and monthly.
5. Structure as continuous prose with alternating lines: Speaker 1: ... / Speaker 2: ...
6. Target length: 20-50 words.
7. Avoid inventing facts not provided.
8. Output only the transcript and optional title as JSON matching this schema: { Transcript: string, Title?: string }`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          Transcript: { type: "string" },
          Title: { type: "string" },
        },
        required: ["Transcript"],
      },
    },
  };

  return await sendRequest(url, body);
}

async function generatePodcastAudio(transcriptText) {
  const MODEL_ID_TTS = "gemini-2.5-pro-preview-tts";
  const urlTTS = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID_TTS}:${GENERATE_CONTENT_API}?key=${encodeURIComponent(
    GEMINI_API_KEY
  )}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: transcriptText }] }],
    generationConfig: {
      responseModalities: ["audio"],
      temperature: 1,
      speech_config: {
        multi_speaker_voice_config: {
          speaker_voice_configs: [
            {
              speaker: "Speaker 1",
              voice_config: { prebuilt_voice_config: { voice_name: "Zephyr" } },
            },
            {
              speaker: "Speaker 2",
              voice_config: { prebuilt_voice_config: { voice_name: "Puck" } },
            },
          ],
        },
      },
    },
  };

  const res = await fetch(urlTTS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const buf = Buffer.from(await res.arrayBuffer());
    const isWav = buf.slice(0, 4).toString("ascii") === "RIFF";
    const out = isWav ? buf : pcmToWav(buf, 24000, 1, 16);
    fs.writeFileSync("podcast.wav", out);
    console.log("podcast.wav saved (binary path)");
    return out;
  }

  const json = await res.json();
  const events = Array.isArray(json) ? json : [json];

  let mime = "audio/L16;codec=pcm;rate=24000";
  const chunks = [];

  for (const ev of events) {
    const cand = ev?.candidates?.[0];
    if (!cand) continue;

    const parts = cand?.content?.parts || [];
    for (const p of parts) {
      if (p?.inlineData?.mimeType && p?.inlineData?.data) {
        mime = p.inlineData.mimeType;
        chunks.push(Buffer.from(p.inlineData.data, "base64"));
      } else if (p?.audio && p.audio?.data) {
        if (p.audio.mimeType) mime = p.audio.mimeType;
        chunks.push(Buffer.from(p.audio.data, "base64"));
      }
    }

    const media = cand?.media || ev?.media;
    if (Array.isArray(media)) {
      for (const m of media) {
        if (m?.mimeType && m?.data) {
          mime = m.mimeType;
          chunks.push(Buffer.from(m.data, "base64"));
        }
      }
    }
  }

  if (!chunks.length) {
    throw new Error("No se encontraron chunks de audio en la respuesta JSON.");
  }

  const audioBuf = Buffer.concat(chunks);
  const isWav =
    mime.includes("wav") || audioBuf.slice(0, 4).toString("ascii") === "RIFF";
  const out = isWav ? audioBuf : pcmToWav(audioBuf, 24000, 1, 16);
  fs.writeFileSync("podcast.wav", out);
  console.log(`podcast.wav saved (JSON path, mime=${mime})`);
  return out;
}

function pcmToWav(
  pcmBuffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const wavHeader = Buffer.alloc(44);

  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavHeader.write("WAVE", 8);
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}

async function sendRequest(url, body) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const chunks = await res.json();
    const fullText = (Array.isArray(chunks) ? chunks : [chunks])
      .map((c) => c?.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .join("");
    return JSON.parse(fullText);
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

(async () => {
  const promptText = `My name is Rebeca Wilkinson. I work as a marketing coordinator for a mid-sized tech company, managing social media campaigns and coordinating with design and sales teams. My days are usually fast-paced, filled with meetings and deadlines, which can leave me feeling mentally drained.  

Lately, I've been trying to prioritize my health by walking in the mornings and preparing healthier meals at home. I also want to improve my time management so I can spend more quality time with friends and focus on personal projects like photography.  

My main goals right now are to stay consistent with my morning walks, read more regularly, and create a better evening routine that helps me wind down and sleep earlier.
`;

  console.log("\n==== HABITS ====");
  const habits = await generateHabits(promptText);
  console.log(habits);
  fs.writeFileSync("habits.json", JSON.stringify(habits, null, 2));

  console.log("\n==== WEEKLY PLANNER ====");
  const weekly = await generateWeeklyPlanner(promptText);
  console.log(weekly);
  fs.writeFileSync("weekly.json", JSON.stringify(weekly, null, 2));

  console.log("\n==== MONTHLY REVIEW ====");
  const monthly = await generateMonthlyReview(promptText);
  console.log(monthly);
  fs.writeFileSync("monthly.json", JSON.stringify(monthly, null, 2));

  const podcastInput = JSON.stringify({
    firstPrompt: promptText,
    habits,
    weekly,
    monthly,
  });
  fs.writeFileSync("podcastInput.json", podcastInput);

  console.log("\n==== PODCAST TRANSCRIPT ====");
  const transcriptObj = await generatePodcastTranscript(podcastInput);
  console.log(transcriptObj.Transcript);
  fs.writeFileSync(
    "podcastTranscript.json",
    JSON.stringify(transcriptObj, null, 2)
  );

  console.log("\n==== GENERATING AUDIO ====");
  await generatePodcastAudio(transcriptObj.Transcript);
})();
