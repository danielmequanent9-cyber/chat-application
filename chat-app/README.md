# Chat App

A beginner-friendly messaging UI built with plain HTML5, CSS3, and vanilla JavaScript (ES6+). It runs entirely in your browser and does not need a backend, framework, package manager, or build step.

## Run with VS Code Live Server

1. Open the `chat-app` folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. Open `index.html` in the editor.
4. Click **Go Live** in the VS Code status bar, or right-click `index.html` and choose **Open with Live Server**.
5. The app opens in your browser. Use the contacts list to open a conversation.

You can also open `index.html` directly in a modern browser. Live Server is recommended for a consistent local development experience.

## Features

- Six seeded demo contacts with initials, message previews, timestamps, and unread counts.
- Search contacts by name as you type.
- Press `/` outside an editable field to focus contact search.
- Select a contact to open the conversation and clear its unread count.
- Send a message with the button or Enter. Shift+Enter inserts a newline.
- Empty messages are rejected; messages are limited to 5,000 characters.
- Clear a conversation after confirming the action.
- Conversations, unread counts, and the selected contact are saved in browser LocalStorage.
- Responsive layout: contacts and chat side by side on desktop; contacts first with a Back to contacts button on mobile.
- Accessible labels, semantic controls, visible keyboard focus, and clear empty states.

## Limitations

- This is a local UI demo, not a real messaging service. Messages do not reach another person and there is no real-time delivery, account, or online status.
- Data is stored only in this browser's LocalStorage. Clearing browser data or using another browser/device will remove or not show the saved conversations.
- Demo contacts and received messages are sample content. Only messages you send are added locally.
- The app uses system fonts and makes no external network requests.

## Test checklist

- [ ] Load the app and confirm the contacts list and welcome state appear.
- [ ] Search for a contact by full or partial name, then clear the search.
- [ ] Press `/` while outside a text field and confirm contact search receives focus.
- [ ] Open a contact and confirm the conversation and unread badge update.
- [ ] Send a message with Enter and with the Send button; try Shift+Enter for a newline.
- [ ] Confirm whitespace-only messages cannot be sent.
- [ ] Reload the page and confirm sent messages and the selected conversation are restored.
- [ ] Open Theo Rivera's empty conversation and confirm its empty state.
- [ ] Clear a conversation, first canceling and then confirming the prompt.
- [ ] At a narrow/mobile viewport, open a contact and use Back to contacts.
- [ ] Navigate with the keyboard and confirm controls have visible focus.
- [ ] If LocalStorage is unavailable or contains invalid data, confirm the app remains usable.
