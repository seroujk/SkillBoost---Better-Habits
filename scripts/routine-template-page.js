import { generateText } from "../utils/geminiapi.js";

// Existing built-in routine templates
const routines = [
  { id: "morning-routine", title: "Morning Routine", time: "6:00 AM–7:00 AM", items: ["Wake up at 6:00 AM", "Drink water", "Healthy breakfast"] },
  { id: "study-habits", title: "Study Habits", time: "8:00 AM–10:00 AM", items: ["Revise Previous Chapters", "Review Project Goals", "Start Coding"] },
  { id: "wellness", title: "Wellness", time: "9:00 AM-10:30 AM", items: ["Exercise", "Meditation (15 min)", "Gratitude practice"] },
];

// Rendering the routine templates
function renderRoutines(data) {
  const section = document.querySelector(".cards__section");
  const tpl = document.getElementById("card");

  const container = tpl.content.querySelector(".cards__container").cloneNode(true);
  container.innerHTML = "";

  data.forEach((routine) => {
    const cardEl = tpl.content.querySelector(".card").cloneNode(true);

    cardEl.querySelector(".card__title").textContent = routine.title;

    const listEl = cardEl.querySelector(".card__list");
    listEl.innerHTML = "";
    routine.items.forEach((text) => {
      const li = document.createElement("li");
      li.className = "card__list-item";
      const span = document.createElement("span");
      span.className = "card__list-paragraph";
      span.textContent = text;
      li.appendChild(span);
      listEl.appendChild(li);
    });

    cardEl.querySelector(".card__btn").addEventListener("click", () => openModal(routine));
    container.appendChild(cardEl);
  });

  section.appendChild(container);
}

// Modal Functionality
function openModal(routine) {
  const tpl = document.getElementById("routine-modal");
  const existing = document.querySelector(".modal[data-kind='routine']");
  if (existing) existing.remove();

  const modalEl = tpl.content.querySelector(".modal").cloneNode(true);
  modalEl.dataset.kind = "routine";

  modalEl.querySelector(".modal__title").textContent = routine.title;
  const list = modalEl.querySelector(".modal__list");
  list.innerHTML = "";
  routine.items.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    list.appendChild(li);
  });

  // actions
  const inputEl = modalEl.querySelector(".modal__input");
  const genBtn = modalEl.querySelector(".modal__generate-btn");

  genBtn.addEventListener("click", () => {
    const userText = (inputEl.value || "").trim();
    if (!userText) {
      genBtn.textContent = "Please describe your routine first";
      setTimeout(() => (genBtn.textContent = "Generate Routine"), 1200);
      return;
    }
    genBtn.disabled = true;
    genBtn.textContent = "Generating…";

    const prompt = buildStrictJSONPrompt(userText);

    generateText(prompt)
      .then((text) => {
        const jsonStr = extractJSON(text);
        let obj;
        try {
          obj = JSON.parse(jsonStr);
        } catch (e) {
          throw new Error("Model returned invalid JSON:\n" + text);
        }

        // Convert to tracker routine shape and persist
        const newRoutine = {
          id: slugify(obj.title),
          title: obj.title,
          // tracker cards expect an items array; use your 3 habits
          items: Array.isArray(obj.habits) ? obj.habits.slice(0, 4) : [],
          // optional: stash color/icon if you later want card styling
          meta: { color: obj.color, icon: obj.icon, description: obj.description },
        };

        const key = "generatedRoutines";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.push(newRoutine);
        localStorage.setItem(key, JSON.stringify(existing));

        // Send the user to the Tracker page
        window.location.href = "./routine-tracker-page.html";
      })
      .catch((err) => {
        genBtn.textContent = "Failed — try again";
        console.error(err);
      })
      .finally(() => {
        genBtn.disabled = false;
        setTimeout(() => (genBtn.textContent = "Generate Routine"), 1200);
      });
  });

  modalEl.classList.add("is-open");
  document.body.appendChild(modalEl);

  const close = () => modalEl.remove();
  modalEl.querySelector(".modal__close").addEventListener("click", close);
  modalEl.querySelector(".modal__overlay").addEventListener("click", close);
  document.addEventListener("keydown", function onEsc(e) {
    if (e.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); }
  });
}

// Forming The Prompt


/* Converts a string into a short, URL-safe slug.
* Steps:
* 1. Lowercase the string
* 2. Replace non-alphanumeric sequences with a single dash
* 3. Remove leading/trailing dashes
* 4. Limit to 48 characters
* 5. If empty, return "routine-" + random 6-character ID
*/
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "routine-" + Math.random().toString(36).slice(2, 8);
}

function buildStrictJSONPrompt(userPrompt) {
  return `
You are an API that returns strictly valid JSON in this shape:
{
  "title": "Card Title with Emoji",
  "description": "Optional description",
  "habits": ["Habit 1", "Habit 2", "Habit 3"],
  "color": "#hexcolor",
  "icon": "emoji"
}
Rules:
- Title must include at least one emoji.
- Tile must only be two words.
- Emoji should come before the words.
- Description: 1–2 concise sentences.
- "habits": exactly 4 short, actionable habits.
- "color": valid hex like "#FF5733".
- "icon": single emoji.
- "Do not suggest the same habits twice"
- Output JSON only. No extra text, no code fences.

USER CONTEXT:
${userPrompt}
`.trim();
}

// In case Gemini Still Uses Code Fencing
function extractJSON(text) {
  const fenced = text.match(/```(?:json)?([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start, end + 1);
  }
  return raw.trim();
}

document.addEventListener("DOMContentLoaded", () => renderRoutines(routines));
