# Attachments System Implementation

Sistema completo di gestione attachments per Plannerinator con upload su Cloudflare R2.

## 📋 Sommario

Il sistema di attachments è stato implementato completamente e supporta:

✅ Upload file per tutte le entità (task, event, note, project, collection_item)
✅ Storage su Cloudflare R2 (S3-compatible)
✅ Presigned URLs per upload e download sicuri
✅ Quota storage per utente (default 1GB)
✅ Validazione file lato client e server
✅ Drag & drop upload
✅ Progress indicators
✅ File type icons
✅ Download con signed URLs
✅ Delete con cleanup R2 + DB

## 🗄️ Database Schema

### Tabella `attachment`

```sql
CREATE TABLE attachment (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Entity reference (polymorphic)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'event', 'note', 'project', 'collection_item')),
  entity_id UUID NOT NULL,

  -- File metadata
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,

  -- R2 Storage
  storage_key TEXT NOT NULL UNIQUE,
  storage_url TEXT, -- Public URL (if using public bucket)

  -- Custom metadata (JSONB)
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_entity ON attachment(entity_type, entity_id);
CREATE INDEX idx_attachments_user ON attachment(user_id);
CREATE INDEX idx_attachments_storage_key ON attachment(storage_key);
```

### Update Tabella `user`

```sql
ALTER TABLE user ADD COLUMN storage_quota_bytes BIGINT DEFAULT 1073741824 NOT NULL; -- 1GB
ALTER TABLE user ADD COLUMN storage_used_bytes BIGINT DEFAULT 0 NOT NULL;
```

## 📁 File Structure

```
src/
├── features/attachments/
│   ├── schema.ts           # Zod validation, MIME types, helpers
│   ├── queries.ts          # Database queries, storage quota
│   └── actions.ts          # Server Actions (upload, delete, download)
├── components/attachments/
│   ├── FileUpload.tsx      # Drag & drop upload component
│   ├── AttachmentList.tsx  # List attachments with icons
│   ├── AttachmentsSection.tsx  # Combined upload + list
│   └── StorageQuota.tsx    # Storage quota display
├── lib/
│   └── r2-client.ts        # Cloudflare R2 client (S3-compatible)
└── app/dashboard/
    ├── notes/[id]/page.tsx  # Attachments integrated
    └── profile/page.tsx     # Storage quota display
```

## 🔧 Configuration

### Environment Variables

Aggiungi al file `.env`:

```bash
# Cloudflare R2 Storage
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="plannerinator-attachments"

# Attachment Settings
MAX_FILE_SIZE_MB="10"
DEFAULT_STORAGE_QUOTA_GB="1"
```

### Wrangler (Production)

File `wrangler.jsonc` già configurato con variabili non-secret.

**Setup secrets per produzione:**

```bash
pnpm wrangler secret put R2_ACCESS_KEY_ID
pnpm wrangler secret put R2_SECRET_ACCESS_KEY
```

## 🚀 Setup R2

Segui la guida completa in `docs/R2_SETUP.md`:

1. Crea bucket R2 su Cloudflare Dashboard
2. Configura CORS per upload diretto
3. Genera API tokens
4. Configura environment variables
5. (Opzionale) Setup lifecycle policies per cleanup

**Quick start:**

```bash
# Test R2 connection
pnpm wrangler r2 bucket list

# Create bucket
pnpm wrangler r2 bucket create plannerinator-attachments

# Upload test file
echo "test" > test.txt
pnpm wrangler r2 object put plannerinator-attachments/test.txt --file=test.txt

# List objects
pnpm wrangler r2 object list plannerinator-attachments

# Delete test
pnpm wrangler r2 object delete plannerinator-attachments/test.txt
```

## 💻 Usage

### In Note Detail Page

Già integrato! Visita `/dashboard/notes/[id]` e vedrai la sezione "Attachments".

### Add to Other Entities

Per aggiungere attachments ad altre entità (task, event, project), **fetch server-side** e passa come prop:

```tsx
// In page.tsx (Server Component)
import { getAttachmentsByEntity } from "@/features/attachments/queries";
import { AttachmentsSection } from "@/components/attachments/AttachmentsSection";

export default async function TaskDetailPage({ params }) {
  const { id } = await params;

  // Fetch attachments server-side
  const attachments = await getAttachmentsByEntity("task", id);

  return (
    <div>
      {/* ... other content ... */}

      <AttachmentsSection
        entityType="task" // or "event", "project", "collection_item"
        entityId={id}
        initialAttachments={attachments} // Required: pass server-fetched data
        title="Task Attachments" // optional
        maxFiles={5} // optional, default 5
      />
    </div>
  );
}
```

**⚠️ Importante:** `AttachmentsSection` è un Client Component, quindi **non può** fare database queries direttamente. Devi sempre fare il fetch server-side e passare `initialAttachments`.

### Programmatic Upload

```typescript
import { generateUploadUrl, confirmAttachmentUpload } from "@/features/attachments/actions";

// 1. Generate presigned URL
const { uploadUrl, storageKey } = await generateUploadUrl({
  entityType: "note",
  entityId: noteId,
  fileName: file.name,
  fileSize: file.size,
  mimeType: file.type,
  metadata: {},
});

// 2. Upload to R2
const response = await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": file.type },
});

// 3. Confirm upload
await confirmAttachmentUpload({
  entityType: "note",
  entityId: noteId,
  fileName: file.name,
  fileSize: file.size,
  mimeType: file.type,
  storageKey,
  metadata: {},
});
```

### Check Storage Quota

```typescript
import { getUserStorageQuota, hasStorageSpace } from "@/features/attachments/queries";

// Get quota info
const quota = await getUserStorageQuota();
console.log(`Used: ${quota.usedBytes} / ${quota.quotaBytes}`);
console.log(`Available: ${quota.availableBytes}`);
console.log(`Usage: ${quota.usagePercentage}%`);

// Check if user has space for new file
const canUpload = await hasStorageSpace(fileSize);
```

## 📝 Supported File Types

### Images

- PNG, JPEG, JPG, GIF, WebP, SVG

### Documents

- PDF
- Word (DOC, DOCX)
- Excel (XLS, XLSX)
- PowerPoint (PPT, PPTX)
- Text (TXT, MD, CSV)

### Archives

- ZIP, RAR, 7Z

### Media

- Video: MP4, MPEG, MOV, WebM
- Audio: MP3, WAV, OGG

## 🔒 Security

- **Presigned URLs:** Temporary URLs with expiration (15min upload, 1h download)
- **Ownership validation:** Users can only access their own attachments
- **Storage isolation:** Files stored with user ID in path (`userId/entityType/entityId/file`)
- **MIME type validation:** Server-side validation of file types
- **Quota enforcement:** Per-user storage limits enforced

## 🎨 UI Components

### FileUpload

Drag & drop zone con:

- Visual feedback on drag
- Multiple file upload (max 5 per default)
- Client-side validation
- Progress bars
- Error handling

### AttachmentList

Lista attachments con:

- File type icons (color-coded)
- File size e data upload
- Download button
- Delete action
- Empty state

### StorageQuota

Display quota con:

- Usage bar (color-coded: green → yellow → red)
- Used/available bytes
- Percentage
- Warning messages

## ⚙️ Server Actions

### Upload

- `generateUploadUrl()` - Genera presigned URL per upload diretto a R2
- `confirmAttachmentUpload()` - Salva metadata in DB dopo upload

### Delete

- `deleteAttachment()` - Elimina file da R2 + record DB
- `bulkDeleteAttachments()` - Elimina multipli attachments

### Download

- `getAttachmentDownloadUrl()` - Genera signed URL per download sicuro

### Update

- `updateAttachment()` - Aggiorna fileName e metadata (file content immutabile)

## 📊 Database Queries

### Single Attachment

- `getAttachmentById()` - Get attachment con ownership check

### Lists

- `getAttachments()` - Lista con filtri (entityType, entityId, category, mimeType)
- `getAttachmentsByEntity()` - Tutti gli attachments di una specifica entity
- `getAttachmentCount()` - Count attachments per entity

### Storage Quota

- `getUserStorageQuota()` - Info complete su quota utente
- `hasStorageSpace()` - Check se c'è spazio per nuovo file
- `calculateStorageUsed()` - Ricalcola storage usato (per sync)

## 🧪 Testing

### Manual Testing

1. **Upload:**
   - Vai su `/dashboard/notes/[id]`
   - Drag & drop un file o click per selezionare
   - Verifica progress bar
   - Verifica file appare in lista

2. **Download:**
   - Click su Download button
   - Verifica file si scarica correttamente

3. **Delete:**
   - Click su Delete nel dropdown menu
   - Conferma
   - Verifica file rimosso da lista
   - Verifica storage quota aggiornato

4. **Storage Quota:**
   - Vai su `/dashboard/profile`
   - Verifica storage quota display
   - Upload più file e verifica quota si aggiorna

### Automated Testing (TODO)

```bash
# TODO: Add tests for:
# - File upload workflow
# - Storage quota enforcement
# - Delete cascade (entity deleted → attachments deleted)
# - R2 signed URL generation
# - MIME type validation
```

## 🐛 Troubleshooting

### Upload fails

**Error:** "Storage quota exceeded"

- **Fix:** Delete alcuni attachments o aumenta quota utente

**Error:** "File type not allowed"

- **Fix:** Verifica che il file type sia in `ALLOWED_MIME_TYPES` (schema.ts)

**Error:** "Failed to generate upload URL"

- **Fix:** Verifica R2 credentials in `.env`

### Download fails

**Error:** "Attachment not found"

- **Fix:** Verifica ownership dell'attachment

**Error:** "Failed to generate download URL"

- **Fix:** Verifica R2 bucket exists e credentials corrette

### R2 Connection Issues

```bash
# Test R2 connection
pnpm wrangler r2 bucket list

# Check bucket exists
pnpm wrangler r2 bucket get plannerinator-attachments

# Check environment variables
echo $R2_ACCOUNT_ID
echo $R2_ACCESS_KEY_ID
```

## 📈 Future Enhancements

Vedi `docs/plannerinator/planning/BACKLOG.md` per feature future:

- **Image preview** inline in notes
- **PDF viewer** embedded
- **Video player** embedded
- **File versioning** (upload nuova versione mantenendo history)
- **Public sharing** con expiring links
- **Malware scanning** (ClamAV integration)
- **Bulk download** (ZIP multiple attachments)
- **Storage analytics** per admin

## 📚 References

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AWS SDK S3 Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/)
- [R2 Setup Guide](./R2_SETUP.md)

---

**Implementation completed on:** 2025-01-24
**Version:** v0.6.0 (attachment system)
**Status:** ✅ Ready for testing
