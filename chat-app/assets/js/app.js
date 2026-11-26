"use strict";

const STORAGE_KEY = "chat-app-state-v1";
const MAX_MESSAGE_LENGTH = 5000;

const contacts = [
  { id: "ava", name: "Ava Morgan", initials: "AM", color: "#dc8f77", unread: 2 },
  { id: "noah", name: "Noah Bennett", initials: "NB", color: "#6d9d91", unread: 1 },
  { id: "mia", name: "Mia Chen", initials: "MC", color: "#a18ad0", unread: 0 },
  { id: "leo", name: "Leo Williams", initials: "LW", color: "#d5a856", unread: 0 },
  { id: "isla", name: "Isla Patel", initials: "IP", color: "#7297c4", unread: 3 },
  { id: "theo", name: "Theo Rivera", initials: "TR", color: "#c27e9c", unread: 0 }
];

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function seedConversations() {
  return {
    ava: [
      { id: "ava-1", sender: "contact", text: "Hey! How did your weekend hike go?", timestamp: minutesAgo(130) },
      { id: "ava-2", sender: "me", text: "It was lovely. The trail was quiet and the view was worth the early start.", timestamp: minutesAgo(124) },
      { id: "ava-3", sender: "contact", text: "That sounds perfect. Send me the trail name when you get a chance!", timestamp: minutesAgo(18) }
    ],
    noah: [
      { id: "noah-1", sender: "me", text: "Are we still on for the market on Saturday?", timestamp: minutesAgo(980) },
      { id: "noah-2", sender: "contact", text: "Absolutely! I found a little coffee place nearby too.", timestamp: minutesAgo(940) },
      { id: "noah-3", sender: "me", text: "Great, let's meet there first.", timestamp: minutesAgo(925) },
      { id: "noah-4", sender: "contact", text: "Perfect. I'll send you the address later today.", timestamp: minutesAgo(55) }
    ],
    mia: [
      { id: "mia-1", sender: "contact", text: "I made a playlist for our road trip 🎶", timestamp: minutesAgo(3500) },
      { id: "mia-2", sender: "me", text: "Already giving it a listen. This is such a good mix!", timestamp: minutesAgo(3420) }
    ],
    leo: [
      { id: "leo-1", sender: "me", text: "Thanks again for sharing that recipe.", timestamp: minutesAgo(8400) },
      { id: "leo-2", sender: "contact", text: "Anytime! Did you try adding a little lemon?", timestamp: minutesAgo(8200) },
      { id: "leo-3", sender: "me", text: "I did, and it made all the difference.", timestamp: minutesAgo(8100) }
    ],
    isla: [
      { id: "isla-1", sender: "contact", text: "The book club pick arrived today 📚", timestamp: minutesAgo(250) },
      { id: "isla-2", sender: "me", text: "Nice! I'm excited to get started.", timestamp: minutesAgo(230) },
      { id: "isla-3", sender: "contact", text: "We can meet at the usual spot next week.", timestamp: minutesAgo(12) }
    ],
    theo: []
  };
}

function createInitialState() {
  const conversations = seedConversations();
  const unreadCounts = {};

  contacts.forEach((contact) => {
    unreadCounts[contact.id] = contact.unread;
  });

  return { selectedContactId: null, conversations, unreadCounts };
}

function isValidMessage(message) {
  return message !== null
    && typeof message === "object"
    && typeof message.id === "string"
    && typeof message.text === "string"
    && message.text.length <= MAX_MESSAGE_LENGTH
    && (message.sender === "me" || message.sender === "contact")
    && typeof message.timestamp === "string"
    && Number.isFinite(Date.parse(message.timestamp));
}

function loadState() {
  const fallback = createInitialState();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return fallback;
    }

    const parsed = JSON.parse(stored);
    if (parsed === null || typeof parsed !== "object" || parsed.version !== 1) {
      return fallback;
    }

    const conversations = {};
    const unreadCounts = {};

    contacts.forEach((contact) => {
      const savedMessages = parsed.conversations?.[contact.id];
      conversations[contact.id] = Array.isArray(savedMessages)
        ? savedMessages.filter(isValidMessage)
        : fallback.conversations[contact.id];

      const unread = parsed.unreadCounts?.[contact.id];
      unreadCounts[contact.id] = Number.isInteger(unread) && unread >= 0 && unread <= 999
        ? unread
        : fallback.unreadCounts[contact.id];
    });

    const selectedContactId = contacts.some((contact) => contact.id === parsed.selectedContactId)
      ? parsed.selectedContactId
      : null;

    return { selectedContactId, conversations, unreadCounts };
  } catch {
    return fallback;
  }
}

let state = loadState();

const elements = {
  app: document.querySelector("#app"),
  contactList: document.querySelector("#contact-list"),
  contactCount: document.querySelector("#contact-count"),
  contactSearch: document.querySelector("#contact-search"),
  activeAvatar: document.querySelector("#active-contact .avatar"),
  activeName: document.querySelector("#active-name"),
  activeSubtitle: document.querySelector("#active-subtitle"),
  conversation: document.querySelector("#conversation"),
  welcomeState: document.querySelector("#welcome-state"),
  messageList: document.querySelector("#message-list"),
  messageEmpty: document.querySelector("#message-empty"),
  messageInput: document.querySelector("#message-input"),
  messageForm: document.querySelector("#message-form"),
  sendButton: document.querySelector("#send-button"),
  clearButton: document.querySelector("#clear-button"),
  backButton: document.querySelector("#back-button"),
  storageNote: document.querySelector("#storage-note")
};

const fullTimestampFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const shortTimestampFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric"
});

const todayFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "numeric",
  day: "numeric"
});

function formatMessageTimestamp(timestamp) {
  return fullTimestampFormatter.format(new Date(timestamp));
}

function formatContactTimestamp(timestamp) {
  const date = new Date(timestamp);
  return todayFormatter.format(date) === todayFormatter.format(new Date())
    ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date)
    : shortTimestampFormatter.format(date);
}

function getLastMessage(contactId) {
  const messages = state.conversations[contactId] || [];
  return messages[messages.length - 1] || null;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      selectedContactId: state.selectedContactId,
      conversations: state.conversations,
      unreadCounts: state.unreadCounts
    }));
    elements.storageNote.textContent = "Demo conversations are saved on this device.";
    elements.storageNote.classList.remove("is-warning");
  } catch {
    elements.storageNote.textContent = "Browser storage is unavailable; changes may not persist.";
    elements.storageNote.classList.add("is-warning");
  }
}

function createAvatar(contact, extraClass = "") {
  const avatar = document.createElement("span");
  avatar.className = `avatar ${extraClass}`.trim();
  avatar.textContent = contact.initials;
  avatar.style.backgroundColor = contact.color;
  avatar.setAttribute("aria-hidden", "true");
  return avatar;
}

function renderContacts() {
  const query = elements.contactSearch.value.trim().toLocaleLowerCase();
  const visibleContacts = contacts.filter((contact) => contact.name.toLocaleLowerCase().includes(query));
  const fragment = document.createDocumentFragment();

  elements.contactCount.textContent = `${visibleContacts.length}`;

  if (visibleContacts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "contact-empty";
    empty.textContent = "No people found. Try a different name.";
    fragment.append(empty);
  } else {
    visibleContacts.forEach((contact) => {
      const latest = getLastMessage(contact.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "contact-item";
      button.dataset.contactId = contact.id;
      button.setAttribute("aria-pressed", String(state.selectedContactId === contact.id));
      button.setAttribute("aria-label", `${contact.name}${state.unreadCounts[contact.id] ? `, ${state.unreadCounts[contact.id]} unread` : ""}`);
      button.append(createAvatar(contact));

      const copy = document.createElement("span");
      copy.className = "contact-copy";

      const topline = document.createElement("span");
      topline.className = "contact-topline";
      const name = document.createElement("span");
      name.className = "contact-name";
      name.textContent = contact.name;
      const time = document.createElement("time");
      time.className = "contact-time";
      if (latest) {
        time.dateTime = latest.timestamp;
        time.textContent = formatContactTimestamp(latest.timestamp);
      }
      topline.append(name, time);

      const bottomline = document.createElement("span");
      bottomline.className = "contact-bottomline";
      const preview = document.createElement("span");
      preview.className = "contact-preview";
      preview.textContent = latest ? latest.text.replace(/\s+/g, " ") : "No messages yet";
      bottomline.append(preview);

      const unread = state.unreadCounts[contact.id];
      if (unread > 0) {
        const badge = document.createElement("span");
        badge.className = "unread-badge";
        badge.textContent = String(unread);
        badge.setAttribute("aria-hidden", "true");
        bottomline.append(badge);
      }

      copy.append(topline, bottomline);
      button.append(copy);
      fragment.append(button);
    });
  }

  elements.contactList.replaceChildren(fragment);
}

function renderMessages() {
  const contact = contacts.find((item) => item.id === state.selectedContactId);
  const hasContact = Boolean(contact);
  const messages = hasContact ? state.conversations[contact.id] : [];
  const fragment = document.createDocumentFragment();

  elements.welcomeState.hidden = hasContact;
  elements.messageList.hidden = !hasContact || messages.length === 0;
  elements.messageEmpty.hidden = !hasContact || messages.length > 0;
  elements.messageInput.disabled = !hasContact;
  elements.messageInput.placeholder = hasContact ? "Write a message…" : "Choose a contact to start chatting";
  elements.clearButton.disabled = !hasContact || messages.length === 0;
  elements.sendButton.disabled = !hasContact || elements.messageInput.value.trim().length === 0;
  elements.app.classList.toggle("is-chat-open", hasContact);

  if (!hasContact) {
    elements.activeAvatar.className = "avatar avatar-placeholder";
    elements.activeAvatar.textContent = "…";
    elements.activeAvatar.style.backgroundColor = "";
    elements.activeName.textContent = "Your messages";
    elements.activeSubtitle.textContent = "Choose someone to start a conversation";
    elements.messageList.replaceChildren();
    return;
  }

  elements.activeAvatar.className = "avatar";
  elements.activeAvatar.textContent = contact.initials;
  elements.activeAvatar.style.backgroundColor = contact.color;
  elements.activeAvatar.setAttribute("aria-hidden", "true");
  elements.activeName.textContent = contact.name;
  elements.activeSubtitle.textContent = "Your conversation";

  messages.forEach((message) => {
    const row = document.createElement("li");
    row.className = `message-row${message.sender === "me" ? " message-row--me" : ""}`;

    const bubble = document.createElement("p");
    bubble.className = "message-bubble";
    bubble.textContent = message.text;

    const time = document.createElement("time");
    time.className = "message-time";
    time.dateTime = message.timestamp;
    time.textContent = formatMessageTimestamp(message.timestamp);
    row.append(bubble, time);
    fragment.append(row);
  });

  elements.messageList.replaceChildren(fragment);
  elements.conversation.scrollTop = elements.conversation.scrollHeight;
}

function render() {
  renderContacts();
  renderMessages();
}

function selectContact(contactId) {
  if (!contacts.some((contact) => contact.id === contactId)) {
    return;
  }

  state.selectedContactId = contactId;
  state.unreadCounts[contactId] = 0;
  saveState();
  render();
}

function sendMessage() {
  const text = elements.messageInput.value.trim();
  const contactId = state.selectedContactId;

  if (!contactId || text.length === 0 || text.length > MAX_MESSAGE_LENGTH) {
    return;
  }

  const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `message-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  state.conversations[contactId].push({
    id,
    sender: "me",
    text,
    timestamp: new Date().toISOString()
  });
  elements.messageInput.value = "";
  saveState();
  render();
  elements.messageInput.focus();
}

function clearConversation() {
  const contact = contacts.find((item) => item.id === state.selectedContactId);
  if (!contact || state.conversations[contact.id].length === 0) {
    return;
  }

  const confirmed = window.confirm(`Clear your conversation with ${contact.name}? This cannot be undone.`);
  if (!confirmed) {
    return;
  }

  state.conversations[contact.id] = [];
  state.unreadCounts[contact.id] = 0;
  saveState();
  render();
}

elements.contactList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-contact-id]");
  if (button) {
    selectContact(button.dataset.contactId);
  }
});

elements.contactSearch.addEventListener("input", renderContacts);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isEditing = target instanceof Element
    && target.closest("input, textarea, select, [contenteditable='true']");

  if (event.key === "/" && !event.altKey && !event.ctrlKey && !event.metaKey && !isEditing) {
    event.preventDefault();
    elements.contactSearch.focus();
  }
});

elements.messageInput.addEventListener("input", () => {
  elements.sendButton.disabled = !state.selectedContactId || elements.messageInput.value.trim().length === 0;
});

elements.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    sendMessage();
  }
});

elements.messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

elements.clearButton.addEventListener("click", clearConversation);

elements.backButton.addEventListener("click", () => {
  state.selectedContactId = null;
  saveState();
  render();
});

saveState();
render();
