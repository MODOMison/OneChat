# OneChat

OneChat is a lightweight Windows communication hub that anchors to the left side of the screen and stays always on top. It opens as a small side rail and expands into a compact drawer for messages, search, contacts, file links, undo, and text correction.

## Run

Open PowerShell and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -STA -File .\OneChatMini.ps1
```

## Current App

- `OneChatMini.ps1` is the current working app.
- It saves local message/contact/file state to `onechat-data.json`.
- It does not use a website or browser.
- It is built with PowerShell and WPF, so it runs as a native Windows overlay.

## Features

- Left-side anchored always-on-top hub
- Compact open/close drawer
- Local contacts and threads
- Local message sending
- Search across contacts and thread previews
- Add person
- File link into a conversation
- Undo last local sent message
- Simple text fix for `omw` to `On my way`

## Notes

The current version is a local communication hub. Real integrations with iMessage, Discord, Gmail, Instagram, or WhatsApp require separate API/auth work and platform-specific permissions.

