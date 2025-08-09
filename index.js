const modalContainer = document.querySelector(".modal-outer-container");
const openModalBtn = document.querySelector(".add-more-cards-btn");
const editSuggestionsBtn = document.querySelector(".edit-suggestions-btn");

openModalBtn.addEventListener("click", () => {
    console.log("openModalBtn clicked");
    modalContainer.innerHTML = "";
    fetch("./pages/addMoreCards.html")
        .then(response => response.text())
        .then(data => {
            console.log("data fetched");
            modalContainer.innerHTML = data;
            
            // Now get all modal elements after content is loaded
            const modal = document.querySelector("#add-more-cards-modal");
            const addMoreCardsModalCloseBtn = modal.querySelector(".modal__close-btn");
            const addMoreCardsForm = document.forms["add-more-cards-form"];
            const addMoreCardsFormTitleInput = modal.querySelector("#card-title-input");
            const addMoreCardsFormRoutineInput = modal.querySelector("#routine-input");
            const addMoreCardsFormSubmitBtn = modal.querySelector(".modal__submit-btn");
            
            console.log("modal after fetch:", modal);
            
            // Setup close button event listener
            addMoreCardsModalCloseBtn.addEventListener("click", () => {
                closeModal(modal);
            });
            
            // Setup form submit event listener (you can uncomment and complete this)
            // addMoreCardsForm.addEventListener("submit", (evt) => {
            //     evt.preventDefault();
            //     // Handle form submission here
            // });
            
            // Open the modal
            openModal(modal);
        });
});

editSuggestionsBtn.addEventListener("click", () => {
    console.log("editSuggestionsBtn clicked");
    modalContainer.innerHTML = "";
    fetch("./pages/editSuggestions.html")
        .then(response => response.text())
        .then(data => {
            console.log("data fetched");
            modalContainer.innerHTML = data;
        });
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