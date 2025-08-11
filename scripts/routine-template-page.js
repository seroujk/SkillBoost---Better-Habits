// Routines Info
const routines = [
    {
      id: "morning-routine",
      title: "Morning Routine",
      time: "6:00 AM–7:00 AM",
      items: ["Wake up at 6:00 AM", "Drink water", "Healthy breakfast"],
    },
    {
      id: "study-habits",
      title: "Study Habits",
      time: "8:00 AM–10:00 AM",
      items: ["Revise Previous Chapters", "Review Project Goals", "Start Coding"],
    },
    {
      id: "wellness",
      title: "Wellness",
      time: "9:00 AM-10:30 AM",
      items: ["Exercise", "Meditation (15 min)", "Gratitude practice"],
    },
  ];
  
  // 2) Render helper
  function renderRoutines(data) {
    const section = document.querySelector(".cards__section");
    const tpl = document.getElementById("card");
  
    // Create a fresh container UL from the template
    const container = tpl.content.querySelector(".cards__container").cloneNode(true);
    container.innerHTML = ""; // remove the placeholder li
  
    data.forEach((routine) => {
      // Clone the single card
      const cardEl = tpl.content.querySelector(".card").cloneNode(true);
  
  
      // Title line: "Name"
      const titleEl = cardEl.querySelector(".card__title");
      titleEl.textContent = `${routine.title}`;
  
      // Build the bullet list
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
  
      
      cardEl.querySelector(".card__btn").addEventListener("click", () => {
        openModal(routine); // <- opens the modal with this card's data
      });
      
  
      container.appendChild(cardEl);
    });
  
    section.appendChild(container);
  }
  
  function openModal(routine) {
    const tpl = document.getElementById("routine-modal");
  
    // Clean up any previous instance
    const existing = document.querySelector(".modal[data-kind='routine']");
    if (existing) existing.remove();
  
    // Clone modal DOM from the template
    const modalEl = tpl.content.querySelector(".modal").cloneNode(true);
    modalEl.dataset.kind = "routine";
  
    // Populate
    modalEl.querySelector(".modal__title").textContent = routine.title;
    const list = modalEl.querySelector(".modal__list");
    list.innerHTML = "";
    routine.items.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      list.appendChild(li);
    });
  
    // Show (toggle your visibility class here)
    modalEl.classList.add("is-open");
  
    // Mount
    document.body.appendChild(modalEl);
  
    // Close handlers
    const close = () => modalEl.remove();
    modalEl.querySelector(".modal__close").addEventListener("click", close);
    modalEl.querySelector(".modal__overlay").addEventListener("click", close);
    document.addEventListener("keydown", function onEsc(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); }
    });
  }
  
  document.addEventListener("click", (e) => {
    if (e.target.matches(".modal__close") || e.target.matches("#routine-modal.open")) {
      closeModal();
    }
  });
  
  

  document.addEventListener("DOMContentLoaded", () => renderRoutines(routines));
  