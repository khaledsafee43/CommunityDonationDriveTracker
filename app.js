const state = {
  items: [],
  sessionContributions: [],
  nextSessionId: 1,
  loadSucceeded: false,
  searchTerm: "",
  statusFilter: "all",
  donorFilter: "",
};
const loadState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorBTN = document.getElementById("retry-btn");
const appContent = document.getElementById("app-content");
const statMet = document.getElementById("stat-met");
const statTotalItem = document.getElementById("stat-total-items");
const statSessionCount = document.getElementById("stat-session-count");
const searchInput = document.getElementById("search-input");
const statFilter = document.getElementById("status-filter");
const cardsContainer = document.getElementById("cards-container");
const cardsEmptyStat = document.getElementById("cards-empty-state");
const contributionForm = document.getElementById("contribution-form");
const donorName = document.getElementById("donor-name");
const addItem = document.getElementById("add-item");
const quantityInput = document.getElementById("quantity-input");
const submitContributionBTN = document.getElementById(
  "submit-contribution-btn"
);
const formMessage = document.getElementById("form-message");
const donorFilter = document.getElementById("donor-filter");
const sessionTableBody = document.getElementById("session-table-body");
const sessionEmptyState = document.getElementById("session-empty-state");
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
    const data = await response.json();
    state.items = Array.isArray(data) ? data : [];
    state.loadSucceeded = true;
    loadState.classList.add("hidden");
    appContent.classList.remove("hidden");
    updateDonorFilter();
    renderCards();
    renderDataTable();
    renderSummary();
  } catch (err) {
    console.error("Loading error:", err);
    state.loadSucceeded = false;
    loadState.classList.add("hidden");
    appContent.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
}
function countTargetsMet() {
  return state.items.filter((item) => {
    const target = Number(item.target) || 0;
    const received = Number(item.received) || 0;
    if (target <= 0) {
      return received > 0;
    }
    return received >= target;
  }).length;
}
function getFilteredItems() {
  const search = state.searchTerm.toLowerCase().trim();
  const donor = state.donorFilter.toLowerCase().trim();
  const status = state.statusFilter;
  return state.items.filter((item) => {
    const itemName = String(item.item || "").toLowerCase();
    const donorNameValue = String(item.donor || "").toLowerCase();
    const target = Number(item.target) || 0;
    const received = Number(item.received) || 0;
    const isMet =
      target > 0
        ? received >= target
        : received > 0;
    const matchesSearch =
      !search ||
      itemName.includes(search) ||
      donorNameValue.includes(search);
    const matchesDonor =
      !donor || donorNameValue === donor;
    let matchesStatus = true;
    if (status === "met") {
      matchesStatus = isMet;
    }
    if (status === "needed") {
      matchesStatus = !isMet;
    }
    return (
      matchesSearch &&
      matchesDonor &&
      matchesStatus
    );
  });
}
function renderCards() {
  const filteredItems = getFilteredItems();
  if (filteredItems.length === 0) {
    cardsContainer.innerHTML = "";
    cardsEmptyStat.classList.remove("hidden");
    return;
  }
  cardsEmptyStat.classList.add("hidden");
  const allData = filteredItems.map((item) => {
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
          ${item.item || ""}
        </h3>
        <p>
          Donor:
          ${item.donor || "-"}
        </p>
        <p>
          Received:
          ${received}
          of
          ${target}
          ${item.unit || ""}
        </p>
        <p>
          Remaining:
          ${remaining}
          ${item.unit || ""}
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
function renderDataTable() {
  const filteredItems = getFilteredItems();
  if (filteredItems.length === 0) {
    sessionTableBody.innerHTML = "";
    sessionEmptyState.classList.remove("hidden");
    return;
  }
  sessionEmptyState.classList.add("hidden");
  const dataOfTable = filteredItems.map((item) => {
    const originalIndex = state.items.indexOf(item);
    return `
      <tr>
        <td>
          ${item.donor || ""}
        </td>
        <td>
          ${item.item || ""}
        </td>
        <td>
          ${item.received || 0}
        </td>
        <td>
          <button
            class="btn-danger"
            data-index="${originalIndex}">
            Remove
          </button>
        </td>
      </tr>
    `;
  });
  sessionTableBody.innerHTML =
    dataOfTable.join("");
}
sessionTableBody.addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn-danger")) {
    return;
  }
  const index = Number(
    e.target.dataset.index
  );
  if (
    Number.isNaN(index) ||
    index < 0 ||
    index >= state.items.length
  ) {
    return;
  }
  const item = state.items[index];
  const confirmed = confirm(
    `Are you sure you want to remove "${item.item}"?`
  );
  if (!confirmed) {
    return;
  }
  state.items.splice(index, 1);
  updateDonorFilter();
  renderCards();
  renderDataTable();
  renderSummary();
});
function renderSummary() {
  statMet.textContent =
    String(countTargetsMet());
  statTotalItem.textContent =
    String(state.items.length);
  statSessionCount.textContent =
    String(state.sessionContributions.length);
}
function updateDonorFilter() {
  if (!donorFilter) {
    return;
  }
  const currentValue =
    donorFilter.value;
  const donors = [
    ...new Set(
      state.items
        .map((item) => item.donor)
        .filter(Boolean)
    ),
  ];
  donorFilter.innerHTML = `
    <option value="">All Donors</option>
    ${donors
      .map(
        (donor) => `
          <option value="${donor}">
            ${donor}
          </option>
        `
      )
      .join("")}
  `;
  if (donors.includes(currentValue)) {
    donorFilter.value = currentValue;
  }
}
if (searchInput) {
  searchInput.addEventListener(
    "input",
    (e) => {
      state.searchTerm =
        e.target.value;
      renderCards();
      renderDataTable();
    }
  );
}
if (statFilter) {
  statFilter.addEventListener(
    "change",
    (e) => {
      state.statusFilter =
        e.target.value;
      renderCards();
      renderDataTable();
    }
  );
}
if (donorFilter) {
  donorFilter.addEventListener(
    "change",
    (e) => {
      state.donorFilter =
        e.target.value;
      renderCards();
      renderDataTable();
    }
  );
}
if (contributionForm) {
  contributionForm.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      const donor =
        donorName.value.trim();
      const item =
        addItem.value.trim();
      const quantity =
        Number(quantityInput.value);
      if (!donor) {
        showFormMessage(
          "Please enter donor name.",
          "error"
        );
        return;
      }
      if (!item) {
        showFormMessage(
          "Please select an item.",
          "error"
        );
        return;
      }
      if (
        Number.isNaN(quantity) ||
        quantity <= 0
      ) {
        showFormMessage(
          "Please enter a valid quantity.",
          "error"
        );
        return;
      }
      const contribution = {
        id: state.nextSessionId,
        donor: donor,
        item: item,
        quantity: quantity,
      };
      state.nextSessionId++;
      state.sessionContributions.push(
        contribution
      );
      const existingItem =
        state.items.find(
          (itemData) =>
            String(itemData.item)
              .toLowerCase() ===
            item.toLowerCase()
        );
      if (existingItem) {
        existingItem.received =
          (Number(existingItem.received) || 0) +
          quantity;
      }
      contributionForm.reset();
      showFormMessage(
        "Contribution added successfully.",
        "success"
      );
      updateDonorFilter();
      renderCards();
      renderDataTable();
      renderSummary();
    }
  );
}
function showFormMessage(
  message,
  type
) {
  if (!formMessage) {
    return;
  }

  formMessage.textContent =
    message;

  formMessage.className =
    "form-message " + type;

  setTimeout(() => {
    formMessage.textContent = "";
    formMessage.className =
      "form-message";
  }, 3000);
}
if (errorBTN) {
  errorBTN.addEventListener(
    "click",
    () => {
      loadAllData();
    }
  );
}
loadAllData();