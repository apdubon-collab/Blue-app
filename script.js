const dom = {
  navToggle: document.getElementById("navToggle"),
  primaryNav: document.getElementById("primaryNav"),
  reportForm: document.getElementById("taskForm"),
  reportName: document.getElementById("taskInput"),
  reportNotes: document.getElementById("taskNotes"),
  reportRating: document.getElementById("rating"),
  reportPhoto: document.getElementById("photo"),
  photoPreview: document.getElementById("photoPreview"),
  reportList: document.getElementById("taskList"),
  reportCount: document.getElementById("taskCount"),
  stationList: document.getElementById("stationList"),
  stationCount: document.getElementById("stationCount"),
  mapContainer: document.getElementById("map"),
  locateBtn: document.getElementById("locateBtn"),
  chatModal: document.getElementById("chatModal"),
  chatStationName: document.getElementById("chatStationName"),
  chatMessages: document.getElementById("chatMessages"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  chatCloseBtn: document.getElementById("chatCloseBtn"),
  year: document.getElementById("year"),
};

const state = {
  reports: [],
  navOpen: false,
  map: null,
  markers: null,
  userLocation: null,
  activePhotoData: null,
  activeChatStationId: null,
  refreshTimer: null,
};

const SAMPLE_STATIONS = [
  {
    id: "s1",
    name: "Canal St. Water Fountain",
    notes: "Clean filtered water, open 24/7",
    coords: { lat: 29.957, lng: -90.063 },
  },
  {
    id: "s2",
    name: "Lafayette Square Pavilion",
    notes: "Portable refill station (May be seasonal)",
    coords: { lat: 29.958, lng: -90.067 },
  },
  {
    id: "s3",
    name: "Jackson Square Water Station",
    notes: "Water bottles available for a small donation",
    coords: { lat: 29.9575, lng: -90.0645 },
  },
];

function setYear() {
  const currentYear = new Date().getFullYear();
  if (dom.year) dom.year.textContent = currentYear;
}

function saveState() {
  try {
    const payload = JSON.stringify(state.reports);
    localStorage.setItem("blueStations", payload);
  } catch (error) {
    console.warn("Unable to save station state", error);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem("blueStations");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return false;
    state.reports = parsed;
    return true;
  } catch (error) {
    console.warn("Unable to load station state", error);
    return false;
  }
}

function updateReportCount() {
  const count = state.reports.length;
  if (dom.reportCount) dom.reportCount.textContent = count;
  if (dom.stationCount) dom.stationCount.textContent = count;
}

function createReportElement(report) {
  const item = document.createElement("li");
  item.className = "task-item";

  const text = document.createElement("div");
  text.style.flex = "1";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "flex-start";

  const name = document.createElement("p");
  name.className = "task-item__text";
  name.textContent = report.name;

  const rating = document.createElement("span");
  rating.style.fontSize = "0.85rem";
  rating.style.opacity = "0.85";
  rating.style.letterSpacing = "0.05em";
  rating.textContent = report.rating ? `Rating: ${report.rating}/5` : "No rating";

  header.appendChild(name);
  header.appendChild(rating);

  const note = document.createElement("p");
  note.className = "task-item__text";
  note.style.opacity = "0.75";
  note.style.marginTop = "0.25rem";
  note.textContent = report.notes || "No additional notes.";

  text.appendChild(header);
  text.appendChild(note);

  if (report.photo) {
    const preview = document.createElement("img");
    preview.src = report.photo;
    preview.alt = `Photo of ${report.name}`;
    preview.style.maxWidth = "100%";
    preview.style.borderRadius = "12px";
    preview.style.marginTop = "0.6rem";
    text.appendChild(preview);
  }

  const actions = document.createElement("div");
  actions.className = "task-item__actions";

  const viewButton = document.createElement("button");
  viewButton.className = "task-button";
  viewButton.type = "button";
  viewButton.textContent = "View";
  viewButton.addEventListener("click", () => {
    if (report.coords && state.map) {
      state.map.setView([report.coords.lat, report.coords.lng], 16, { animate: true });
    }
  });

  const chatButton = document.createElement("button");
  chatButton.className = "task-button";
  chatButton.type = "button";
  chatButton.textContent = "Chat";
  chatButton.addEventListener("click", () => {
    openChat(report.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "task-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Remove";
  deleteButton.addEventListener("click", () => {
    deleteReport(report.id);
  });

  actions.appendChild(viewButton);
  actions.appendChild(chatButton);
  actions.appendChild(deleteButton);

  item.appendChild(text);
  item.appendChild(actions);

  return item;
}

function createStationElement(report) {
  const item = document.createElement("li");
  item.className = "task-item";

  const text = document.createElement("div");
  text.style.flex = "1";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "flex-start";

  const name = document.createElement("p");
  name.className = "task-item__text";
  name.textContent = report.name;

  const rating = document.createElement("span");
  rating.style.fontSize = "0.85rem";
  rating.style.opacity = "0.85";
  rating.style.letterSpacing = "0.05em";
  rating.textContent = report.rating ? `Rating: ${report.rating}/5` : "No rating";

  header.appendChild(name);
  header.appendChild(rating);

  const note = document.createElement("p");
  note.className = "task-item__text";
  note.style.opacity = "0.75";
  note.style.marginTop = "0.25rem";
  note.textContent = report.notes || "No additional notes.";

  text.appendChild(header);
  text.appendChild(note);

  if (report.photo) {
    const preview = document.createElement("img");
    preview.src = report.photo;
    preview.alt = `Photo of ${report.name}`;
    preview.style.maxWidth = "100%";
    preview.style.borderRadius = "12px";
    preview.style.marginTop = "0.6rem";
    text.appendChild(preview);
  }

  const actions = document.createElement("div");
  actions.className = "task-item__actions";

  const viewButton = document.createElement("button");
  viewButton.className = "task-button";
  viewButton.type = "button";
  viewButton.textContent = "View";
  viewButton.addEventListener("click", () => {
    if (report.coords && state.map) {
      state.map.setView([report.coords.lat, report.coords.lng], 16, { animate: true });
    }
  });

  const chatButton = document.createElement("button");
  chatButton.className = "task-button";
  chatButton.type = "button";
  chatButton.textContent = "Chat";
  chatButton.addEventListener("click", () => {
    openChat(report.id);
  });

  actions.appendChild(viewButton);
  actions.appendChild(chatButton);

  item.appendChild(text);
  item.appendChild(actions);

  return item;
}

function renderReports() {
  if (dom.reportList) {
    dom.reportList.innerHTML = "";

    if (state.reports.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "task-item";
      emptyItem.innerHTML = `
        <p class="task-item__text">No stations shared yet — add one to help the community.</p>
      `;
      dom.reportList.appendChild(emptyItem);
    } else {
      state.reports.forEach((report) => {
        dom.reportList.appendChild(createReportElement(report));
      });
    }
  }

  if (dom.stationList) {
    dom.stationList.innerHTML = "";

    if (state.reports.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "task-item";
      emptyItem.innerHTML = `
        <p class="task-item__text">No stations nearby yet — add a station or use the map.</p>
      `;
      dom.stationList.appendChild(emptyItem);
    } else {
      state.reports.forEach((report) => {
        dom.stationList.appendChild(createStationElement(report));
      });
    }
  }

  updateReportCount();
}

function addReport(name, notes, rating, photo) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const newReport = {
    id: crypto.randomUUID(),
    name: trimmed,
    notes: notes.trim(),
    rating: Number(rating) || null,
    photo: photo || null,
    messages: [],
    createdAt: Date.now(),
    coords: state.userLocation ? { ...state.userLocation } : null,
  };

  state.reports.push(newReport);
  saveState();
  renderReports();
  updateMarkers();
}

function deleteReport(id) {
  state.reports = state.reports.filter((report) => report.id !== id);
  saveState();
  renderReports();
  updateMarkers();
}

function bindReportEvents() {
  if (!dom.reportForm) return;

  dom.reportPhoto?.addEventListener("change", () => {
    const file = dom.reportPhoto.files?.[0];
    if (!file) {
      state.activePhotoData = null;
      dom.photoPreview.style.display = "none";
      dom.photoPreview.innerHTML = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      state.activePhotoData = reader.result;
      dom.photoPreview.style.display = "block";
      dom.photoPreview.innerHTML = `<img src="${reader.result}" alt="Photo preview" />`;
    };
    reader.readAsDataURL(file);
  });

  dom.reportForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addReport(
      dom.reportName.value,
      dom.reportNotes.value,
      dom.reportRating?.value,
      state.activePhotoData
    );
    dom.reportName.value = "";
    dom.reportNotes.value = "";
    if (dom.reportRating) dom.reportRating.value = "";
    if (dom.reportPhoto) dom.reportPhoto.value = "";
    state.activePhotoData = null;
    dom.photoPreview.style.display = "none";
    dom.photoPreview.innerHTML = "";
    dom.reportName.focus();
  });
}

function initMap() {
  if (!dom.mapContainer) return;

  state.map = L.map(dom.mapContainer, {
    zoomControl: true,
    attributionControl: false,
  }).setView([29.958, -90.064], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(state.map);

  state.markers = L.layerGroup().addTo(state.map);

  state.reports = [...SAMPLE_STATIONS];
  renderReports();
  updateMarkers();

  if (dom.locateBtn) {
    dom.locateBtn.addEventListener("click", locateUser);
  }

  state.map.on("click", (event) => {
    const { lat, lng } = event.latlng;
    if (confirm("Add a new water station at this location?")) {
      const name = prompt("Station name", "New water station");
      if (!name) return;
      const notes = prompt("Notes (optional)", "");
      state.reports.push({
        id: crypto.randomUUID(),
        name,
        notes: notes || "",
        rating: null,
        photo: null,
        messages: [],
        createdAt: Date.now(),
        coords: { lat, lng },
      });
      saveState();
      renderReports();
      updateMarkers();
    }
  });
}

function addMarker(report) {
  if (!report.coords || !state.markers) return;

  const marker = L.marker([report.coords.lat, report.coords.lng]);
  const rating = report.rating ? `Rating: ${report.rating}/5<br>` : "";
  const photo = report.photo
    ? `<div style="margin-top:0.5rem;"><img src="${report.photo}" alt="${report.name}" style="width:100%;border-radius:12px;"/></div>`
    : "";

  marker.bindPopup(`
    <strong>${report.name}</strong><br>
    ${rating}
    ${report.notes || ""}
    ${photo}
  `);
  marker.addTo(state.markers);
}
function updateMarkers() {
  if (!state.markers) return;
  state.markers.clearLayers();

  state.reports.forEach((report) => {
    if (report.coords) {
      addMarker(report);
    }
  });
}

function getReportById(id) {
  return state.reports.find((report) => report.id === id);
}

function renderChatMessages(report) {
  if (!dom.chatMessages) return;
  dom.chatMessages.innerHTML = "";

  const messages = report.messages || [];
  if (!messages.length) {
    const empty = document.createElement("p");
    empty.className = "modal__message";
    empty.textContent = "No messages yet — ask the reporter about availability.";
    dom.chatMessages.appendChild(empty);
    return;
  }

  messages.forEach((message) => {
    const wrapper = document.createElement("div");
    wrapper.className = "modal__message" + (message.self ? " modal__message--self" : "");

    const meta = document.createElement("div");
    meta.className = "modal__message__meta";
    const timestamp = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    meta.textContent = message.self ? `You · ${timestamp}` : `Reporter · ${timestamp}`;

    const text = document.createElement("p");
    text.className = "modal__message__text";
    text.textContent = message.text;

    wrapper.appendChild(meta);
    wrapper.appendChild(text);
    dom.chatMessages.appendChild(wrapper);
  });

  dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

function openChat(reportId) {
  state.activeChatStationId = reportId;
  const report = getReportById(reportId);
  if (!report) return;

  if (dom.chatStationName) dom.chatStationName.textContent = report.name;
  renderChatMessages(report);

  if (dom.chatModal) dom.chatModal.classList.add("modal--open");
  if (dom.chatModal) dom.chatModal.setAttribute("aria-hidden", "false");
  if (dom.chatInput) dom.chatInput.focus();
}

function closeChat() {
  state.activeChatStationId = null;
  if (dom.chatModal) dom.chatModal.classList.remove("modal--open");
  if (dom.chatModal) dom.chatModal.setAttribute("aria-hidden", "true");
}

function addChatMessage(reportId, text, self = true) {
  const report = getReportById(reportId);
  if (!report) return;
  report.messages = report.messages || [];
  report.messages.push({
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now(),
    self,
  });
  saveState();
  renderChatMessages(report);
}

function bindChatEvents() {
  if (!dom.chatModal) return;

  dom.chatCloseBtn?.addEventListener("click", closeChat);

  dom.chatModal.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.close === "true") {
      closeChat();
    }
  });

  dom.chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.activeChatStationId) return;
    const value = dom.chatInput.value.trim();
    if (!value) return;
    addChatMessage(state.activeChatStationId, value, true);
    dom.chatInput.value = "";
  });
}

function locateUser() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      state.userLocation = { lat: latitude, lng: longitude };
      if (state.map) {
        state.map.setView([latitude, longitude], 15, { animate: true });
        L.circle([latitude, longitude], {
          color: "#60a5fa",
          fillColor: "rgba(96, 165, 250, 0.2)",
          fillOpacity: 0.4,
          radius: 200,
        }).addTo(state.map);
      }
    },
    () => {
      alert("Could not determine your location. Please allow location access and try again.");
    }
  );
}

function setNavExpanded(expanded) {
  state.navOpen = expanded;
  if (dom.navToggle) dom.navToggle.setAttribute("aria-expanded", expanded);
  if (dom.primaryNav) dom.primaryNav.setAttribute("aria-hidden", String(!expanded));
}

function bindNavEvents() {
  if (!dom.navToggle || !dom.primaryNav) return;

  dom.navToggle.addEventListener("click", () => {
    setNavExpanded(!state.navOpen);
  });

  document.addEventListener("click", (event) => {
    if (!state.navOpen) return;
    const target = event.target;
    if (!dom.primaryNav.contains(target) && target !== dom.navToggle) {
      setNavExpanded(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavExpanded(false);
    }
  });

  const focusableLinks = dom.primaryNav.querySelectorAll("a");
  focusableLinks.forEach((link) => {
    link.addEventListener("click", () => setNavExpanded(false));
  });
}

function init() {
  setYear();

  const loaded = loadState();
  if (!loaded) {
    state.reports = [...SAMPLE_STATIONS];
    saveState();
  }

  bindReportEvents();
  bindChatEvents();
  bindNavEvents();
  initMap();

  // Keep the map and lists in sync if state changes in another tab.
  state.refreshTimer = setInterval(() => {
    const prev = state.reports.length;
    const loadedNow = loadState();
    if (loadedNow && state.reports.length !== prev) {
      renderReports();
      updateMarkers();
    }
  }, 15_000);

  window.addEventListener("storage", (event) => {
    if (event.key === "blueStations") {
      loadState();
      renderReports();
      updateMarkers();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
