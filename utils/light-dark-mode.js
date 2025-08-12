document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.querySelector(".nav__theme");
  const mobileThemeToggle = document.querySelector(".nav__theme-mobile");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Check for saved theme preference or use system preference
  const currentTheme =
    localStorage.getItem("theme") ||
    (prefersDarkScheme.matches ? "dark" : "light");

  // Apply the current theme
  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
    updateButtonIcons("dark");
  }

  // Desktop theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      toggleTheme();
    });
  }

  // Mobile theme toggle
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener("click", function (e) {
      e.preventDefault();
      toggleTheme();
    });
  }

  function toggleTheme() {
    const body = document.body;
    let theme;

    if (body.classList.contains("dark-mode")) {
      body.classList.remove("dark-mode");
      theme = "light";
    } else {
      body.classList.add("dark-mode");
      theme = "dark";
    }

    updateButtonIcons(theme);
    localStorage.setItem("theme", theme);
  }

  function updateButtonIcons(theme) {
    if (theme === "dark") {
      if (themeToggle)
        themeToggle.style.backgroundImage = "url(./images/buttons/sun.svg)";
      if (mobileThemeToggle) mobileThemeToggle.textContent = "Light Mode ☀️";
    } else {
      if (themeToggle)
        themeToggle.style.backgroundImage = "url(./images/buttons/moon.svg)";
      if (mobileThemeToggle) mobileThemeToggle.textContent = "Dark Mode 🌙";
    }
  }

  // Listen for system theme changes
  prefersDarkScheme.addEventListener("change", (e) => {
    const newTheme = e.matches ? "dark" : "light";
    document.body.classList.toggle("dark-mode", newTheme === "dark");
    updateButtonIcons(newTheme);
    localStorage.setItem("theme", newTheme);
  });
});
