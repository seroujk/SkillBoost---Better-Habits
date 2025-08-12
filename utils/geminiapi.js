const API_KEY = "AIzaSyAwBRy07gXljOvSEWA4sT-Pn22FWWKWa2A"; // demo only
const MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`;


export function generateText(prompt) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };

  return fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((res) => (res.ok ? res.json() : res.text().then((m) => Promise.reject(m))))
    .then((data) => {
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
      return text.trim();
    });
}
