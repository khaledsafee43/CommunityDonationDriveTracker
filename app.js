const state = {
  items: [],
  sessionContributions: [],
  nextSessionId: 1,
  loadSucceeded: false,
  searchTerm: "",
  statusFilter: "all",
  donorFilter: "",
};

// ==========================
// DOM Elements
// ==========================

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

let submitContributionBTN = document.getElementById(
  "submit-contribution-btn"
);

let formMessage = document.getElementById("form-message");

let donorFilter = document.getElementById("donor-filter");
let sessionTableBody = document.getElementById("session-table-body");
let sessionEmptyState = document.getElementById("session-empty-state");

// ==========================
// Load data
// ==========================

async function loadAllData() {
  loadState.classList.remove("hidden");
  errorState.classList.add("hidden");
  appContent.classList.add("hidden");

  try {
    const response = await fetch("data.json");

    if (!response.ok) {
      throw new Error(
        "Network response was not ok (" + response.status + ")"
      );
    }

    // مهم: await اضافه شده
    const data = await response.json();

    // اگر data.json مستقیماً آرایه باشد
    state.items = Array.isArray(data) ? data : [];

    state.loadSucceeded = true;

    loadState.classList.add("hidden");
    appContent.classList.remove("hidden");

    renderCards();

  } catch (err) {
    console.error(err);

    state.loadSucceeded = false;

    loadState.classList.add("hidden");
    appContent.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
}

// ==========================
// Render Cards
// ==========================

function renderCards() {

  // اول بررسی می‌کنیم که data خالی است یا نه
  if (state.items.length === 0) {
    cardsContainer.innerHTML = "";

    cardsEmptyStat.classList.remove("hidden");

    return;
  }

  cardsEmptyStat.classList.add("hidden");

  const allData = state.items.map((item) => {

    const target = Number(item.target) || 0;

    const received = Number(item.received) || 0;

    const remaining = Math.max(
      0,
      target - received
    );

    const progressPercent =
      target > 0
        ? Math.min((received / target) * 100, 100)
        : 0;

    const isMet =
      target > 0
        ? received >= target
        : received > 0;

    return `
      <div class="card ${isMet ? "is-complete" : ""}">

        <h3 class="item-title">
          ${item.item}
        </h3>

        <p>
          Received:
          ${received}
          of
          ${target}
          ${item.unit}
        </p>

        <p>
          Remaining:
          ${remaining}
          ${item.unit}
        </p>

        <div class="progress-track">

          <div
            class="progress-fill"
            style="width: ${progressPercent}%"
          ></div>

        </div>

        <p>
          Progress:
          ${Math.round(progressPercent)}%
        </p>

        <span class="badge ${isMet ? "success" : "warning"}">
          ${isMet ? "Met" : "Still needed"}
        </span>

      </div>
    `;
  });

  cardsContainer.innerHTML = allData.join("");
}

errorBTN.addEventListener("click", () => {
  loadAllData();
});




loadAllData();
