const state = {
  items: [],
  sessionContributions: [],
  nextSessionId: 1,
  loadSucceeded: false,
  searchTerm: "",
  statusFilter: "all",
  donorFilter: "",
};

let loadState = document.getElementById("loading-state");
let errorState = document.getElementById("error-state");
let errorBTN = document.getElementById("retry-btn");
let appContent = document.getElementById("app-content");
let statMet = document.getElementById("stat-met");
let statTotalItem = document.getElementById("stat-total-items");
let statSessionCount = document.getElementById("stat-session-count");
let searchInput = document.getElementById("search-input");
let statFilter = document.getElementById("status-filter");
let cardsContainer = document.getElementById("cards-container");
let cardsEmptyStat = document.getElementById("cards-empty-state");
let contributionForm = document.getElementById("contribution-form");
let donorName = document.getElementById("donor-name");
let addItem = document.getElementById("add-item");
let quantityInput = document.getElementById("quantity-input");
let submitContributionBTN = document.getElementById("submit-contribution-btn");
let formMessage = document.getElementById("form-message");
let donorFilter = document.getElementById("donor-filter");
let sessionTableBody = document.getElementById("session-table-body");
let sessionEmptyState = document.getElementById("session-empty-state");

async function loadAllData() {
  loadState.classList.remove("hidden");
  errorState.classList.add("hidden");
  appContent.classList.add("hidden");
  try {
    const response = fetch("data.json");
    if (!response) {
      throw new Error("The response isn't good");
    }
    const data = await response.json();
    state.items = Array.isArray(data) ? data : [];
    state.loadSucceeded = true;

    loadState.classList.add("hidden");
    appContent.classList.remove("hidden");
    renderAll();
  } catch (err) {
    loadState.classList.add("hidden");
    errorState.remove("hidden");
  }
}



loadAllData();
renderAll();
