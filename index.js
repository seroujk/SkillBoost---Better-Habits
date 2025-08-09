import { setButtonText } from "./utils/helpers.js";
const openModalBtn = document.querySelector(".add-more-cards-btn");
const editSuggestionsBtn = document.querySelector(".edit-suggestions-btn");

const addMoreCadsModal = document.querySelector("#add-more-cards-modal");
const addMoreCardsModalCloseBtn =
  addMoreCadsModal.querySelector(".modal__close-btn");
const addMoreCardsForm = document.forms["add-more-cards-form"];
const addMoreCardsFormTitleInput =
  addMoreCadsModal.querySelector("#card-title-input");
const addMoreCardsFormRoutineInput =
  addMoreCadsModal.querySelector("#routine-input");
const addMoreCardsFormSubmitBtn =
  addMoreCadsModal.querySelector(".modal__submit-btn");

const editSuggestionsModal = document.querySelector("#edit-suggestions-modal");
const editSuggestionsModalClosebtn =
  editSuggestionsModal.querySelector(".modal__close-btn");
const editSuggestionsForm = document.forms["edit-suggestions-form"];
const editSuggestionsFormTitleInput =
  editSuggestionsModal.querySelector("#card-title-input");
const editSuggestionsFormRoutineInput =
  editSuggestionsModal.querySelector("#routine-input");
const editSuggestionsFormSubmitBtn =
  editSuggestionsModal.querySelector(".modal__submit-btn");

// Templated related logic
// const cardTemplate = document
//   .querySelector("#card")
//   .content.querySelector(".card");
// const cardsList = document.querySelector(".cards___container");

// function getCardElement(data) {
//   const cardElement = cardTemplate.cloneNode(true);
//   const cardTitleEl = cardElement.querySelector(".card__title");
//   const cardRoutineEl = cardElement.querySelector(".card__routine");
// }

openModalBtn.addEventListener("click", () => {
  openModal(addMoreCadsModal);
});

addMoreCardsModalCloseBtn.addEventListener("click", () => {
  closeModal(addMoreCadsModal);
});

editSuggestionsBtn.addEventListener("click", () => {
  openModal(editSuggestionsModal);
});

editSuggestionsModalClosebtn.addEventListener("click", () => {
  closeModal(editSuggestionsModal);
});

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscapeKey);
}

function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal.modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

// function to handle AddMoreCards form submit
function handleAddMoreCardsFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  // setButtonText(submitBtn, true);
}

//function to handle EditSuggestions form submit
function handleEditSuggestionsFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  // setButtonText(submitBtn, true);
}

addMoreCardsFormSubmitBtn.addEventListener(
  "submit",
  handleAddMoreCardsFormSubmit
);

editSuggestionsFormSubmitBtn.addEventListener(
  "submit",
  handleEditSuggestionsFormSubmit
);
