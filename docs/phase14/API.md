# Phase 14: REST API Reference

## 1. Editorial & Review Endpoints

### `GET /api/admin/content-review`
- **Description**: Returns queued content items awaiting review.
- **Parameters**: `status` (PENDING, APPROVED, REJECTED, DISPUTED), `priority`, `limit`, `offset`.
- **Response**: Array of `ContentReview` items with content snapshots and SLA metrics.

### `POST /api/admin/content/[id]/review`
- **Description**: Creates or updates a review ticket for content object `id`.
- **Payload**: `{ reason: string, priority: string, reviewerId?: string }`

### `POST /api/admin/content/[id]/approve`
- **Description**: Approves a reviewed content item. Transitions lifecycle to `APPROVED`. Requires two-person sign-off for critical items.
- **Payload**: `{ reviewerId: string, notes?: string }`

### `POST /api/admin/content/[id]/reject`
- **Description**: Rejects candidate content and archives review case.
- **Payload**: `{ reviewerId: string, reason: string }`

### `POST /api/admin/content/[id]/correct`
- **Description**: Creates an immutable correction version (`versionNumber + 1`) and generates diff record.
- **Payload**: `{ newContent: string, reason: string, reviewerId: string }`

### `POST /api/admin/content/[id]/suppress`
- **Description**: Suppresses content from student serving and AI retrieval.
- **Payload**: `{ reason: string, reviewerId: string }`

### `POST /api/admin/content/[id]/restore`
- **Description**: Restores suppressed or retired content back to active review queue.
- **Payload**: `{ reviewerId: string }`

---

## 2. Intelligence & Health Endpoints

### `GET /api/admin/content-intelligence`
- **Description**: Returns platform-wide quality metrics, SLA aging breakdown, and recent diffs.

### `GET /api/admin/content-health`
- **Description**: Returns detailed freshness and validation distributions.

### `GET /api/admin/content-backlog`
- **Description**: Returns identified coverage gaps (unrepresented concepts, missing questions).

### `GET /api/admin/content/[id]/versions`
- **Description**: Returns complete version history and provenance for content object `id`.

### `GET /api/admin/content/[id]/impact`
- **Description**: Calculates upstream/downstream dependency impact report.

### `GET /api/admin/content/[id]/dependencies`
- **Description**: Returns directed graph of dependencies for content object `id`.

### `GET /api/admin/content/[id]/validation`
- **Description**: Returns historical scientific and official validation records.
