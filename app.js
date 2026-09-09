const state = {
  items: [],
  sessionContributions: [],
  nextSessionId: 1,
  loadSucceeded: false,
  searchTerm: "",
  statusFilter: "all",
  donorFilter: ""
};
const loadingStateEl = document.getElementById("loading-state");
const errorStateEl = document.getElementById("error-state");
const retryBtn = document.getElementById("retry-btn");
const appContentEl = document.getElementById("app-content");
const statMetEl = document.getElementById("stat-met");
const statTotalItemsEl = document.getElementById("stat-total-items");
const statSessionCountEl = document.getElementById("stat-session-count");
const searchInput = document.getElementById("search-input");
const statusFilterSelect = document.getElementById("status-filter");
const cardsContainer = document.getElementById("cards-container");
const cardsEmptyState = document.getElementById("cards-empty-state");
const contributionForm = document.getElementById("contribution-form");
const donorNameInput = document.getElementById("donor-name");
const itemSelect = document.getElementById("item-select");
const quantityInput = document.getElementById("quantity-input");
const submitContributionBtn = document.getElementById("submit-contribution-btn");
const formMessageEl = document.getElementById("form-message");
const donorFilterInput = document.getElementById("donor-filter");
const sessionTableBody = document.getElementById("session-table-body");
const sessionEmptyState = document.getElementById("session-empty-state");
async function loadData() {
  loadingStateEl.classList.remove("hidden");
  errorStateEl.classList.add("hidden");
  appContentEl.classList.add("hidden");
  try {
    const response = await fetch("data.json");
    if (!response) {
      throw new Error("Network response was not ok (" + response.status + ")");
    }
    const data = await response.json();
    state.items = Array.isArray(data) ? data : [];
    state.loadSucceeded = true;
    loadingStateEl.classList.add("hidden");
    appContentEl.classList.remove("hidden");
    setControlsDisabled(false);
    populateItemSelect();
    renderAll();
  } catch (err) {
    loadingStateEl.classList.add("hidden");
    errorStateEl.classList.remove("hidden");
    setControlsDisabled(true);
  }
}
function setControlsDisabled(disabled) {
  submitContributionBtn.disabled = disabled;
  donorNameInput.disabled = disabled;
  itemSelect.disabled = disabled;
  quantityInput.disabled = disabled;
}
retryBtn.addEventListener("click", () => {
  if (!state.loadSucceeded) {
    loadData();
  }
});
function calculateItemStats(item) {
  const target = Number(item.target) || 0;
  const received = Number(item.received) || 0;
  const remaining = Math.max(0, target - received);
  const progressPercent = target > 0 ?  ((received / target) * 100) : 0;
  const isMet = target > 0 ? received >= target : received > 0;
  return { remaining, progressPercent, isMet };
}
function countTargetsMet() {
  return state.items.reduce((count, item) => {
    return calculateItemStats(item).isMet ? count + 1 : count;
  }, 0);
}
function normalize(text) {
  return String(text).trim().toLowerCase();
}
function getFilteredItems() {
  const term = normalize(state.searchTerm);
  return state.items.filter((item) => {
    const matchesSearch = term === "" || normalize(item.item).includes(term);
    if (!matchesSearch) return false;
    if (state.statusFilter === "met") {
      return calculateItemStats(item).isMet;
    }
    if (state.statusFilter === "needed") {
      return !calculateItemStats(item).isMet;
    }
    return true;
  });
}
function getFilteredSessionContributions() {
  const term = normalize(state.donorFilter);
  if (term === "") return state.sessionContributions;
  return state.sessionContributions.filter((c) => normalize(c.donor).includes(term));
}
function renderAll() {
  renderSummary();
  renderCards();
  renderSessionTable();
}
function renderSummary() {
  statMetEl.textContent = String(countTargetsMet());
  statTotalItemsEl.textContent = String(state.items.length);
  statSessionCountEl.textContent = String(state.sessionContributions.length);
}
function renderCards() {
  const filtered = getFilteredItems();
  cardsContainer.innerHTML = "";
  if (filtered.length === 0) {
    cardsEmptyState.classList.remove("hidden");
    return;
  }
  cardsEmptyState.classList.add("hidden");
  filtered.forEach((item) => {
    const { remaining, progressPercent, isMet } = calculateItemStats(item);
    const card = document.createElement("article");
    card.className = "card" + (isMet ? " is-complete" : "");
    card.dataset.id = String(item.id);
    const title = document.createElement("h3");
    title.className = "item-title";
    title.textContent = item.item;
    card.appendChild(title);
    const receivedLine = document.createElement("p");
    receivedLine.textContent =
      "Received: " + item.received + " of " + item.target + " " + item.unit;
    card.appendChild(receivedLine);
    const remainingLine = document.createElement("p");
    remainingLine.textContent = "Remaining: " + remaining + " " + item.unit;
    card.appendChild(remainingLine);
    const progressTrack = document.createElement("div");
    progressTrack.className = "progress-track";
    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.setProperty("--progress", Math.min(progressPercent, 100) + "%");
    progressTrack.appendChild(progressFill);
    card.appendChild(progressTrack);
    const progressLine = document.createElement("p");
    progressLine.textContent = "Progress: " + progressPercent + "%";
    card.appendChild(progressLine);
    const badge = document.createElement("span");
    badge.className = "badge " + (isMet ? "success" : "warning");
    badge.textContent = isMet ? "Met" : "Still needed";
    card.appendChild(badge);
    cardsContainer.appendChild(card);
  });
}
function populateItemSelect() {
  itemSelect.innerHTML = "";
  state.items.forEach((item) => {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = item.item + " (" + item.unit + ")";
    itemSelect.appendChild(option);
  });
}
function renderSessionTable() {
  const filtered = getFilteredSessionContributions();
  sessionTableBody.innerHTML = "";
  if (filtered.length === 0) {
    sessionEmptyState.classList.remove("hidden");
    return;
  }
  sessionEmptyState.classList.add("hidden");
  filtered.forEach((contribution) => {
    const row = document.createElement("tr");
    row.dataset.sessionId = String(contribution.sessionId);
    const donorCell = document.createElement("td");
    donorCell.textContent = contribution.donor;
    row.appendChild(donorCell);
    const itemCell = document.createElement("td");
    itemCell.textContent = contribution.itemName;
    row.appendChild(itemCell);
    const qtyCell = document.createElement("td");
    qtyCell.textContent = String(contribution.quantity);
    row.appendChild(qtyCell);
    const actionCell = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-danger";
    removeBtn.textContent = "Remove";
    removeBtn.dataset.action = "remove";
    removeBtn.dataset.sessionId = String(contribution.sessionId);
    actionCell.appendChild(removeBtn);
    row.appendChild(actionCell);
    sessionTableBody.appendChild(row);
  });
}
function validateContribution(donorRaw, itemId, quantityRaw) {
  const errors = [];
  const donor = donorRaw.trim();
  if (donor.length < 2 || donor.length > 60) {
    errors.push("Donor name must be between 2 and 60 characters.");
  }
  const item = state.items.find((i) => String(i.id) === String(itemId));
  if (!item) {
    errors.push("Please choose a valid item.");
  }
  const quantityText = quantityRaw.trim();
  let quantity = null;
  if (quantityText === "") {
    errors.push("Quantity is required.");
  } else {
    const parsed = Number(quantityText);
    if (!Number.isFinite(parsed) || parsed % 1 !== 0) {
      errors.push("Quantity must be a whole number.");
    } else if (parsed < 1 || parsed > 1000) {
      errors.push("Quantity must be between 1 and 1000.");
    } else {
      quantity = parsed;
    }
  }
  return { valid: errors.length === 0, errors, donor, item, quantity };
}
function showFormMessage(text, isError) {
  formMessageEl.textContent = text;
  formMessageEl.classList.remove("hidden", "success", "error");
  formMessageEl.classList.add(isError ? "error" : "success");
  formMessageEl.setAttribute("role", isError ? "alert" : "status");
}
contributionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = validateContribution(
    donorNameInput.value,
    itemSelect.value,
    quantityInput.value
  );
  if (!result.valid) {
    showFormMessage(result.errors.join(" "), true);
    return;
  }
  result.item.received = Number(result.item.received) + result.quantity;
  const sessionId = state.nextSessionId;
  state.nextSessionId += 1;
  state.sessionContributions.push({
    sessionId,
    donor: result.donor,
    itemId: result.item.id,
    itemName: result.item.item,
    quantity: result.quantity
  });
  showFormMessage(
    "Recorded " + result.quantity + " " + result.item.unit + " from " + result.donor + ".",
    false
  );
  contributionForm.reset();
  renderAll();
});
sessionTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='remove']");
  if (!button) return;
  const sessionId = Number(button.dataset.sessionId);
  const index = state.sessionContributions.findIndex((c) => c.sessionId === sessionId);
  if (index === -1) return;
  const contribution = state.sessionContributions[index];
  const item = state.items.find((i) => i.id === contribution.itemId);
  if (item) {
    item.received = Number(item.received) - contribution.quantity;
  }
  state.sessionContributions.splice(index, 1);
  showFormMessage("Removed contribution from " + contribution.donor + ".", false);
  renderAll();
});
searchInput.addEventListener("input", (event) => {
  state.searchTerm = event.target.value;
  renderCards();
});
statusFilterSelect.addEventListener("change", (event) => {
  state.statusFilter = event.target.value;
  renderCards();
});
donorFilterInput.addEventListener("input", (event) => {
  state.donorFilter = event.target.value;
  renderSessionTable();
});
loadData();