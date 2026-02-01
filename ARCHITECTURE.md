
---

## `ARCHITECTURE.md`
```md
## Architecture

This system is event-sourced.

The canvas is not state.
The server stores immutable stroke operations.

### Real-time Sync
Clients stream stroke points while drawing.
Other users see strokes live.

### Undo / Redo
Undo removes the most recent global stroke.
Redo restores it.
All clients replay the same state.

### Conflict Handling
No locking.
Conflicts resolved by stroke order.

### User Management
Each user is assigned a unique color.
Presence is broadcast on join/leave.
