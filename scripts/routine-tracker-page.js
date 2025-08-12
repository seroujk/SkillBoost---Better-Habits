let habitData = {};
let routineConfigs = [];
let currentWeek = "";

const jsonFiles = [
  { file: "../utils/morning.json", type: "morning" },
  { file: "../daily.json", type: "daily" },
  { file: "../weekly.json", type: "weekly" },
  { file: "../utils/wellness.json", type: "wellness" },
];

document.addEventListener("DOMContentLoaded", () => {
  setCurrentWeek();
  setupEventListeners();
  loadAllRoutineData(() => {
    renderCards();
    loadSavedHabitData();
    updateAllProgress();
  });
});

function setCurrentWeek() {
  const today = new Date();
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff);

  currentWeek = monday.toISOString().split("T")[0];
  document.getElementById("week-input").value = currentWeek;
}

function setupEventListeners() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("custom-checkbox")) {
      toggleHabit(e.target);
    }
  });

  document.getElementById("week-input").addEventListener("change", (e) => {
    currentWeek = e.target.value;
    loadSavedHabitData();
    updateAllProgress();
  });
}

function loadAllRoutineData(callback) {
  let loadedCount = 0;
  jsonFiles.forEach((item) => {
    loadJsonFile(item.file, item.type, () => {
      loadedCount++;
      if (loadedCount === jsonFiles.length) callback();
    });
  });
}

function loadJsonFile(filename, type, callback) {
  fetch(filename)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      routineConfigs.push({ ...data, type });
      callback();
    })
    .catch((error) => {
      console.warn(`Could not load ${filename}:`, error);
      routineConfigs.push(getFallbackData(type));
      callback();
    });
}

function getFallbackData(type) {
  const fallbackData = {
    morning: {
      title: "🌅 Morning Routine",
      habits: [
        "Drink glass of water",
        "Meditate for 10 minutes",
        "Eat healthy breakfast",
        "Take vitamins",
      ],
      type: "morning",
    },
    daily: {
      title: "💪 Daily Activities",
      habits: [
        "Drink 8 glasses of water",
        "Exercise for 30 minutes",
        "Read for 20 minutes",
      ],
      type: "daily",
    },
    weekly: {
      title: "🎯 Weekly Goals",
      habits: [
        "Learn something new",
        "Connect with family/friends",
        "Complete work tasks on time",
      ],
      type: "weekly",
    },
    wellness: {
      title: "🧘‍♀️ Wellness",
      habits: ["physical activity", "8 hours sleep", "mindful activity"],
      type: "wellness",
    },
  };
  return fallbackData[type] || fallbackData.morning;
}

function renderCards() {
  const cardsGrid = document.getElementById("cards-grid");
  const cardTemplate = document.getElementById("habit-card-template");
  cardsGrid.innerHTML = "";

  routineConfigs.forEach((config) => {
    const cardElement = createCard(config, cardTemplate);
    cardsGrid.appendChild(cardElement);
  });

  cardsGrid.style.display = "grid";
}

function createCard(config, template) {
  const cardClone = template.content.cloneNode(true);
  const card = cardClone.querySelector(".habit-card");

  card.querySelector(".card-title").textContent = config.title;

  const progressFill = card.querySelector(".progress-fill");
  const progressText = card.querySelector(".progress-text");
  progressFill.id = `${config.type}-progress`;
  progressText.id = `${config.type}-text`;

  const tbody = card.querySelector(".habit-tbody");
  config.habits.forEach((habit, index) => {
    const row = createHabitRow(habit, config.type, index);
    tbody.appendChild(row);
  });

  return card;
}

function createHabitRow(habitName, cardType, habitIndex) {
  const rowTemplate = document.getElementById("habit-row-template");
  const rowClone = rowTemplate.content.cloneNode(true);
  const row = rowClone.querySelector("tr");

  row.querySelector(".habit-name").textContent = habitName;

  row.querySelectorAll(".custom-checkbox").forEach((checkbox) => {
    const day = checkbox.dataset.day;
    const habitId = `${cardType}-${habitIndex}`;
    checkbox.dataset.habit = habitId;
    checkbox.dataset.cardType = cardType;
  });

  return row;
}

function toggleHabit(checkbox) {
  const habit = checkbox.dataset.habit;
  const day = checkbox.dataset.day;
  const cardType = checkbox.dataset.cardType;
  const week = currentWeek;

  if (!habitData[week]) habitData[week] = {};
  if (!habitData[week][habit]) habitData[week][habit] = {};

  habitData[week][habit][day] = !habitData[week][habit][day];

  checkbox.classList.toggle("checked", habitData[week][habit][day]);
  updateProgress(cardType);
}

function updateProgress(cardType) {
  const checkboxes = document.querySelectorAll(
    `[data-card-type="${cardType}"]`
  );
  const checkedBoxes = document.querySelectorAll(
    `[data-card-type="${cardType}"].checked`
  );

  const percentage = checkboxes.length
    ? Math.round((checkedBoxes.length / checkboxes.length) * 100)
    : 0;

  const progressFill = document.getElementById(`${cardType}-progress`);
  const progressText = document.getElementById(`${cardType}-text`);

  if (progressFill && progressText) {
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% Complete`;
  }
}

function updateAllProgress() {
  routineConfigs.forEach((config) => updateProgress(config.type));
}

function loadSavedHabitData() {
  const week = currentWeek;
  document.querySelectorAll(".custom-checkbox").forEach((checkbox) => {
    checkbox.classList.remove("checked");
  });

  if (habitData[week]) {
    for (let habit in habitData[week]) {
      for (let day in habitData[week][habit]) {
        if (habitData[week][habit][day]) {
          const checkbox = document.querySelector(
            `[data-habit="${habit}"][data-day="${day}"]`
          );
          if (checkbox) checkbox.classList.add("checked");
        }
      }
    }
  }
}

function showError(message) {
  document.getElementById("error").style.display = "block";
  document.getElementById("error").textContent = message;
  document.getElementById("cards-grid").style.display = "none";
}
