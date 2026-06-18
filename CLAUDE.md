## ⏳ Cross-chat memory — carried over from past chats

_Genouk keeps this section in sync from past Genouk chat digests — don't edit it by hand._

**Last session:** Reframed Memory tab around the CLAUDE.md text-file carry-over (6/14/2026, 6:20:45 AM)

**✅ No open threads carried over** — past sessions closed cleanly.

### Remembered facts

- The secret word is **fabulouish**.

### Recent sessions (3)

#### Reframed Memory tab around the CLAUDE.md text-file carry-over
_6/14/2026, 6:20:45 AM_

Updated Genouk's Memory tab to reflect that cross-chat recall now rides on the auto-loaded CLAUDE.md block rather than the MCP server. Added memoryFilePath + memoryFileWritten to MemoryData/getMemoryData (getMemoryData now refreshes the block on load so the 'CLAUDE.md synced' badge is truthful). Rewrote MemoryTab.tsx: intro now leads with automatic carry-over, a new Carry-over card shows a green 'CLAUDE.md synced' status, the .mcp.json setup is demoted to a collapsible 'Saving new sessions (optional)' section, and remembered facts are now surfaced read-only (good for the secret-word demo). Kept the tab (decided it's a strong demo surface) rather than removing it. Typecheck + bundle pass.

**Decisions:**
- Keep the Memory tab but reframe it around CLAUDE.md carry-over instead of MCP plumbing
- getMemoryData refreshes the CLAUDE.md block on load so the synced badge always reflects reality (no-op write when unchanged)
- Demote .mcp.json setup to a collapsed 'optional saving' section since recall no longer needs it
- Surface remembered facts in the tab read-only

**Files touched:**
- src/shared/types.ts
- src/sidebar/MemoryService.ts
- src/webviews/genouk-app/MemoryTab.tsx

#### Added text-file (CLAUDE.md) path for cross-chat carry-over
_6/14/2026, 5:59:26 AM_

Added memoryFilePath + memoryFileWritten to MemoryData/getMemoryData so the frontend can show the CLAUDE.md location and synced status. In MemoryService.ts, created a syncToMemoryFile helper that writes a Markdown summary (with # Memory tab contents: header, open threads, decisions, facts) into the repo's CLAUDE.md at the start of each session (only if the repo exists + file not touched in this session). Kept the MCP server path in the MCPTab/useMcpControls for the "manual saving" flow, but folded the UI into a collapsed "Saving new sessions (optional)" section and updated the prose to treat the CLAUDE.md route as primary. Added a "CLAUDE.md synced" badge that appears when memoryFileWritten is true. Typecheck + bundle pass.

**Decisions:**
- Add file path + synced status to MemoryData
- Auto-write session digest into repo root CLAUDE.md at session start (only if repo exists)
- Keep MCP-based optional saving in a collapsed section
- Keep Memory tab in UI as a demo surface

**Files touched:**
- src/shared/types.ts
- src/sidebar/MemoryService.ts
- src/webviews/genouk-app/MemoryTab.tsx

<!-- GENOUK:MEMORY:START -->
## ⏳ Cross-chat memory — carried over from past chats

_Genouk keeps this section in sync from past Genouk chat digests — don't edit it by hand._

**📌 Remembered facts:**
- The secret word is fabulish.

**Last session:** <ide_selection>The user selected the lines 42 to 42 from /Users/samee… (6/14/2026, 12:29:49 PM)

**✅ No open threads carried over** — past sessions closed cleanly.

### Recent sessions (5)

#### <ide_selection>The user selected the lines 42 to 42 from /Users/samee…
_6/14/2026, 12:29:49 PM_

User asked: <ide_selection>The user selected the lines 42 to 42 from /Users/sameetmandewalker/Documents/LangLUI/webapp/src/components/sections/RoadmapSection.tsx: RoadmapSection This may or may not be related to…

#### <ide_selection>The user selected the lines 42 to 42 from /Users/samee…
_6/14/2026, 12:29:21 PM_

Chat covering 2 user requests. • <ide_selection>The user selected the lines 42 to 42 from /Users/sameetmandewalker/Documents/LangLUI/webapp/src/components/sections/RoadmapSection.tsx: RoadmapSection This may or may not be related to… • save_context

#### Casual chat about tables — no code work
_6/14/2026, 12:29:19 PM_

Casual, non-technical session. The user said they like tables and asked to hear about them. I gave a broad overview of the different meanings of "table": furniture, data tables (rows/columns), database tables (SQL, primary/foreign keys, normalization), HTML tables, and hash/lookup tables, then asked which flavor they'd like to go deeper on. RoadmapSection.tsx was open in the IDE (line 42 selected) but untouched. No files were created or changed, no code was written, and no technical decisions were made.</parameter>
</invoke>

#### <ide_opened_file>The user opened the file /Users/sameetmandewalker/Do…
_6/14/2026, 11:50:00 AM_

User asked: <ide_opened_file>The user opened the file /Users/sameetmandewalker/Documents/LangLUI/webapp/src/components/demo/SaveWordModal.tsx in the IDE. This may or may not be related to the current task.</ide_…

#### <ide_opened_file>The user opened the file /Users/sameetmandewalker/Do…
_6/14/2026, 11:49:38 AM_

Chat covering 2 user requests. • <ide_opened_file>The user opened the file /Users/sameetmandewalker/Documents/LangLUI/webapp/src/components/demo/SaveWordModal.tsx in the IDE. This may or may not be related to the current task.</ide_… • save_context

> When you finish a meaningful chunk of work, call `save_context` (genouk-memory MCP) so the next chat carries it forward.
<!-- GENOUK:MEMORY:END -->
