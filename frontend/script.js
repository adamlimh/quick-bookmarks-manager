const API = "http://localhost:8000";
let page = 0;
let selectedTags = [];
let allTagsSet = new Set();

const modal = new bootstrap.Modal(document.getElementById('bookmarkModal'));

async function fetchAllTags() {
  allTagsSet.clear();
  const res = await fetch(`${API}/bookmarks?skip=0&limit=1000`);
  const data = await res.json();
  data.forEach(b => b.tags.forEach(t => allTagsSet.add(t)));
}

async function loadBookmarks() {
  let bookmarks = [];

  if (selectedTags.length === 0 || selectedTags.includes("All")) {
    const res = await fetch(`${API}/bookmarks?skip=${page * 10}&limit=10`);
    bookmarks = await res.json();
  } else {
    let results = [];
    for (const tag of selectedTags) {
      const res = await fetch(`${API}/bookmarks/tag/${tag}`);
      const data = await res.json();
      results.push(...data);
    }
    const map = new Map();
    results.forEach(b => map.set(b.id, b)); // 去重
    bookmarks = Array.from(map.values()).slice(page * 10, page * 10 + 10);
  }

  const list = document.getElementById("bookmark-list");
  list.innerHTML = "";

  bookmarks.forEach(b => {
    const card = document.createElement("div");
    card.className = "card mb-2 p-3 shadow-sm d-flex flex-row align-items-center bookmark-card";
    card.dataset.id = b.id;

    card.innerHTML = `
      <div class="drag-handle me-2" style="cursor: grab;">&#x2630;</div>
      <div class="flex-grow-1">
        <strong>${b.title}</strong><br/>
        <a href="${b.url}" target="_blank">${b.url}</a><br/>
        <div class="mt-2">${b.tags.map(t => `
          <span class="badge bg-secondary me-1 tag-pill" onclick="toggleTag('${t}')">${t}</span>
        `).join("")}</div>
      </div>
      <div class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal('${b.id}', '${b.title}', '${b.url}', '${b.tags.join(",")}')">✏️</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteBookmark('${b.id}')">🗑️</button>
      </div>
    `;
    list.appendChild(card);
  });

  renderTagFilter();

  Sortable.create(list, {
    animation: 150,
    handle: ".drag-handle",
    onEnd: async function () {
      const ids = Array.from(document.querySelectorAll(".bookmark-card")).map((el, i) => ({
        id: el.dataset.id,
        order: page * 10 + i
      }));
      await fetch(`${API}/bookmarks/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids)
      });
    }
  });

  updatePaginationControls(bookmarks.length);
}

function renderTagFilter() {
  const div = document.getElementById("tag-filter");
  const tags = Array.from(allTagsSet);
  tags.sort();
  tags.unshift("All");

  div.innerHTML = tags.map(tag => {
    const selected = selectedTags.includes(tag) || (selectedTags.length === 0 && tag === "All");
    return `<button class="btn btn-sm ${selected ? 'btn-dark' : 'btn-outline-dark'} me-1 mb-1" onclick="toggleTag('${tag}')">${tag}</button>`;
  }).join("");
}

function toggleTag(tag) {
  if (tag === "All") {
    selectedTags = [];
  } else {
    const idx = selectedTags.indexOf(tag);
    if (idx >= 0) selectedTags.splice(idx, 1);
    else selectedTags.push(tag);
  }
  page = 0;
  loadBookmarks();
}

async function deleteBookmark(id) {
  await fetch(`${API}/bookmarks/${id}`, { method: "DELETE" });
  await fetchAllTags();
  loadBookmarks();
}

function openAddModal() {
  document.getElementById("bookmark-id").value = "";
  document.getElementById("title").value = "";
  document.getElementById("url").value = "";
  document.getElementById("tags").value = "";
  modal.show();
}

function openEditModal(id, title, url, tags) {
  document.getElementById("bookmark-id").value = id;
  document.getElementById("title").value = title;
  document.getElementById("url").value = url;
  document.getElementById("tags").value = tags;
  modal.show();
}

document.getElementById("bookmarkForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("bookmark-id").value;
  const title = document.getElementById("title").value;
  const url = document.getElementById("url").value;
  const tags = document.getElementById("tags").value.split(",").map(t => t.trim()).filter(Boolean);

  const data = JSON.stringify({ title, url, tags });

  if (id) {
    await fetch(`${API}/bookmarks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: data
    });
  } else {
    // reset to page 0 for new item to show
    page = 0;
    await fetch(`${API}/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data
    });
  }

  await fetchAllTags();
  modal.hide();
  loadBookmarks();
});

function nextPage() {
  page++;
  loadBookmarks();
}

function prevPage() {
  if (page > 0) page--;
  loadBookmarks();
}

function updatePaginationControls(bookmarksLength) {
  document.querySelector("button[onclick='prevPage()']").disabled = page <= 0;
  document.querySelector("button[onclick='nextPage()']").disabled = bookmarksLength < 10;
}

// 初始化
(async () => {
  await fetchAllTags();
  loadBookmarks();
})();
