---
title: Obsidian Drive View
subtitle: Mounting Google Drive as a virtual filesystem in Obsidian
priority: 64
---

Obsidian is fantastic because your notes are just plain files in a folder. On desktop, syncing that folder with Google Drive is trivial, but on mobile (especially iOS and Android) it quickly turns into a headache. Background folder-sync apps fight with mobile OS sandboxing, burn battery, suffer from sync conflicts, and force you to mirror your entire vault onto your phone's local storage.

I built **[Obsidian Drive View](https://github.com/alex-sherman/obsidian-drive-view)** to solve this from the inside out: instead of syncing files on disk behind Obsidian's back, it mounts a Google Drive folder directly inside Obsidian as a **virtual vault backend**.

## Replacing the Vault Adapter at Runtime

Under the hood, Obsidian interacts with the filesystem through an adapter interface at `app.vault.adapter` (`FileSystemAdapter` on Desktop, `CapacitorAdapter` on Mobile).

Rather than fighting the local filesystem, Drive View hot-swaps `app.vault.adapter` at runtime with a custom `GoogleDriveDataAdapter`:

```text
app.vault.adapter (GoogleDriveDataAdapter)
 ├── .obsidian/*   ──► Native Adapter (FileSystemAdapter / CapacitorAdapter)
 └── Vault Files   ──► RAM + IndexedDB Cache ◄──► Google Drive v3 REST API
```

1. **Minimal Local Stub Folder:** Your local vault directory only needs to hold `.obsidian/` (plugin code, settings, and workspace state). Any reads or writes to `.obsidian/*` are transparently forwarded to Obsidian's native platform adapter.
2. **Virtual Vault Filesystem:** Every note, folder, and attachment outside `.obsidian/` lives in Google Drive and is served through an in-memory + **IndexedDB** cache.

## Keeping Reads & Writes Instant

To keep the editor feeling completely native, writes update the in-memory tree and local IndexedDB cache immediately (`<1ms`) while rapid auto-saves coalesce into debounced uploads to the Google Drive v3 API in the background. Embedded images, audio, and PDFs are served directly from cache as in-memory `blob:` URLs without ever touching local disk, and remote edits from other devices are pulled incrementally via Drive's `changes.list` delta feed and reconciled live into open editors.

* **GitHub Repository:** [github.com/alex-sherman/obsidian-drive-view](https://github.com/alex-sherman/obsidian-drive-view)
* **Privacy Policy:** [Drive View Privacy Policy](/drive-view/privacy)
* **Terms of Service:** [Drive View Terms of Service](/drive-view/terms)
