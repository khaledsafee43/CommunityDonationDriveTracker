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
  try {
   const response = await fetch("data.json")
    if(!response.ok){
      throw new Error("Network response was not ok (" + response.status + ")");
    }
    const data = response.json();
    state.items = data;
    state.loadSucceeded = true;
  } catch (err) {
    console.error(err);
  }
}

loadAllData();
