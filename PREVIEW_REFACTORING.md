# Piano di Refactoring: Sistema Preview Estensibile

**Data:** 2025-10-31
**Obiettivo:** Rendere il sistema di preview facilmente estensibile per nuovi tipi di file senza over-engineering

---

## 📋 Stato Attuale

### Componenti Esistenti

- `ImageThumbnail.tsx` - anteprime miniatura immagini
- `ImagePreviewModal.tsx` - modale fullscreen con zoom/rotazione/navigazione
- `useImagePreview.ts` - hook per URL firmati e caching
- `AttachmentCard.tsx` - card con logica condizionale per immagini

### Problemi

- Check `isImageMimeType()` sparsi in più componenti
- Modal e hook specifici solo per immagini
- Nessun pattern per aggiungere nuovi tipi facilmente

---

## 🎯 Obiettivi del Refactoring

1. ✅ Aggiungere nuovi tipi di preview con poche righe di codice
2. ✅ Eliminare duplicazione logica condizionale
3. ✅ Mantenere semplicità - NO pattern complessi
4. ✅ Riusare componenti esistenti dove possibile
5. ✅ Backward compatibility - non rompere nulla

---

## 🛠️ Approccio Pragmatico (NO Over-Engineering)

### Principi

- **Semplicità > Flessibilità estrema**
- **Convention over Configuration**
- **Refactoring incrementale** - una feature alla volta
- **No astrazioni premature** - solo ciò che serve ora

### Cosa NON Faremo

❌ Sistema a plugin complesso
❌ Dependency injection framework
❌ Registry pattern con configurazioni elaborate
❌ Astrazione per ogni singolo dettaglio

### Cosa Faremo

✅ Funzione helper centralizzata per "può fare preview?"
✅ Hook generico che delega a hook specifici
✅ Componente wrapper che carica il viewer giusto
✅ Convention: ogni tipo ha il suo file `{Type}PreviewModal.tsx`

---

## 📐 Architettura Proposta

### 1. File di Configurazione Semplice

**Nuovo file:** `src/features/attachments/preview-config.ts`

```typescript
import { isImageMimeType } from "./schema";

export interface PreviewConfig {
  canPreview: (mimeType: string) => boolean;
  thumbnailComponent: string; // path al componente
  modalComponent: string; // path al componente
}

// Configurazione centralizzata - facile aggiungere nuovi tipi
export const PREVIEW_TYPES = {
  image: {
    canPreview: isImageMimeType,
    thumbnailComponent: "ImageThumbnail",
    modalComponent: "ImagePreviewModal",
  },
  // Futuro:
  // pdf: {
  //   canPreview: isPDFMimeType,
  //   thumbnailComponent: 'PDFThumbnail',
  //   modalComponent: 'PDFPreviewModal'
  // }
} as const;

// Helper unificato
export function canPreview(mimeType: string): boolean {
  return Object.values(PREVIEW_TYPES).some((config) => config.canPreview(mimeType));
}

export function getPreviewType(mimeType: string): keyof typeof PREVIEW_TYPES | null {
  const entry = Object.entries(PREVIEW_TYPES).find(([_, config]) => config.canPreview(mimeType));
  return entry ? (entry[0] as keyof typeof PREVIEW_TYPES) : null;
}
```

**Pro:** Configurazione in un unico posto, facile da estendere
**Anti over-engineering:** Niente factory pattern complicato, solo oggetto semplice

---

### 2. Hook Generico (Wrapper Semplice)

**Nuovo file:** `src/hooks/useAttachmentPreview.ts`

```typescript
import { useImagePreview } from "./useImagePreview";
import { getPreviewType } from "@/features/attachments/preview-config";
import type { Attachment } from "@prisma/client";

export function useAttachmentPreview(attachment: Attachment | null) {
  const previewType = attachment ? getPreviewType(attachment.mimeType) : null;

  // Per ora delega solo a useImagePreview
  // Quando aggiungi PDF: aggiungere usePDFPreview nel switch
  if (previewType === "image") {
    return useImagePreview(attachment);
  }

  // Default: nessuna preview
  return {
    previewUrl: null,
    isLoading: false,
    error: null,
    canPreview: false,
  };
}
```

**Pro:** Riusa hook esistenti, facile aggiungere nuovi
**Anti over-engineering:** Semplice if/switch, no dynamic imports complessi

---

### 3. Modal Wrapper Polimorfico

**Nuovo file:** `src/components/attachments/preview/AttachmentPreviewModal.tsx`

```typescript
import { Attachment } from '@prisma/client';
import { getPreviewType } from '@/features/attachments/preview-config';
import { ImagePreviewModal } from './ImagePreviewModal';
// Futuro: import { PDFPreviewModal } from './PDFPreviewModal';

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  isOpen: boolean;
  onClose: () => void;
  allAttachments?: Attachment[];
}

export function AttachmentPreviewModal(props: AttachmentPreviewModalProps) {
  const { attachment } = props;

  if (!attachment) return null;

  const previewType = getPreviewType(attachment.mimeType);

  // Rendering condizionale semplice
  if (previewType === 'image') {
    return <ImagePreviewModal {...props} />;
  }

  // Futuro:
  // if (previewType === 'pdf') {
  //   return <PDFPreviewModal {...props} />;
  // }

  return null;
}
```

**Pro:** Un solo punto di rendering, componenti specifici invariati
**Anti over-engineering:** No dynamic imports, no lazy loading (a meno che non serve)

---

### 4. Thumbnail Wrapper (Opzionale)

**Stesso pattern per thumbnail:**

```typescript
// src/components/attachments/preview/AttachmentThumbnail.tsx
export function AttachmentThumbnail({ attachment, onPreview }) {
  const previewType = getPreviewType(attachment.mimeType);

  if (previewType === 'image') {
    return <ImageThumbnail attachment={attachment} onPreview={onPreview} />;
  }

  // Futuro: PDF, Video, etc.

  // Fallback: icona generica
  return <GenericThumbnail attachment={attachment} />;
}
```

---

### 5. Refactoring AttachmentCard

**Prima:**

```typescript
const isImage = isImageMimeType(attachment.mimeType);

{isImage ? <ImageThumbnail .../> : <div>...</div>}

{isImage && onPreview && (
  <DropdownMenuItem>Preview</DropdownMenuItem>
)}
```

**Dopo:**

```typescript
import { canPreview } from '@/features/attachments/preview-config';

const hasPreview = canPreview(attachment.mimeType);

{hasPreview ? <AttachmentThumbnail .../> : <div>...</div>}

{hasPreview && onPreview && (
  <DropdownMenuItem>Preview</DropdownMenuItem>
)}
```

**Beneficio:** Un solo check, funziona per tutti i tipi

---

### 6. Refactoring AttachmentList

**Prima:**

```typescript
const imageAttachments = attachments.filter(att =>
  isImageMimeType(att.mimeType)
);

<ImagePreviewModal ... />
```

**Dopo:**

```typescript
const previewableAttachments = attachments.filter(att =>
  canPreview(att.mimeType)
);

<AttachmentPreviewModal ... />
```

**Beneficio:** Gallery funziona per immagini E altri tipi futuri

---

## 🚀 Piano di Implementazione (5 Step)

### Step 1: Creare Configurazione Centralizzata

**File:** `src/features/attachments/preview-config.ts`
**Tempo:** 30 min
**Test:** Importare e verificare `canPreview()` funzioni per immagini

### Step 2: Hook Generico

**File:** `src/hooks/useAttachmentPreview.ts`
**Tempo:** 20 min
**Test:** Usare in un componente, verificare stessa funzionalità

### Step 3: Modal Wrapper

**File:** `src/components/attachments/preview/AttachmentPreviewModal.tsx`
**Tempo:** 30 min
**Test:** Sostituire in AttachmentList, verificare preview immagini funzioni

### Step 4: Thumbnail Wrapper (Opzionale)

**File:** `src/components/attachments/preview/AttachmentThumbnail.tsx`
**Tempo:** 30 min
**Test:** Sostituire in AttachmentCard, verificare rendering

### Step 5: Refactoring Check Condizionali

**File:** `AttachmentCard.tsx`, `AttachmentList.tsx`
**Tempo:** 30 min
**Test:** Regressione completa - upload, preview, delete

**Tempo Totale:** ~2.5 ore

---

## ✅ Checklist Implementazione

- [ ] Creare `preview-config.ts` con configurazione immagini
- [ ] Scrivere test per `canPreview()` e `getPreviewType()`
- [ ] Creare hook `useAttachmentPreview` wrapper
- [ ] Creare componente `AttachmentPreviewModal` wrapper
- [ ] Sostituire `ImagePreviewModal` con wrapper in `AttachmentList`
- [ ] (Opzionale) Creare `AttachmentThumbnail` wrapper
- [ ] Sostituire check `isImageMimeType` con `canPreview` in `AttachmentCard`
- [ ] Sostituire filtro immagini in `AttachmentList`
- [ ] Test regressione completa
- [ ] Verificare keyboard shortcuts ancora funzionanti
- [ ] Verificare gallery navigation

---

## 📝 Come Aggiungere Nuovi Tipi (Esempio PDF)

### 1. Aggiungere MIME type helper (se non esiste)

```typescript
// src/features/attachments/schema.ts
export function isPDFMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf";
}
```

### 2. Registrare in config

```typescript
// src/features/attachments/preview-config.ts
export const PREVIEW_TYPES = {
  image: { ... },
  pdf: {
    canPreview: isPDFMimeType,
    thumbnailComponent: 'PDFThumbnail',
    modalComponent: 'PDFPreviewModal'
  }
};
```

### 3. Creare componente viewer

```typescript
// src/components/attachments/preview/PDFPreviewModal.tsx
export function PDFPreviewModal({ attachment, isOpen, onClose }) {
  // Implementazione PDF viewer
}
```

### 4. Aggiungere in wrapper modal

```typescript
// AttachmentPreviewModal.tsx
if (previewType === 'pdf') {
  return <PDFPreviewModal {...props} />;
}
```

### 5. (Opzionale) Thumbnail PDF

```typescript
// src/components/attachments/preview/PDFThumbnail.tsx
export function PDFThumbnail({ attachment }) {
  // Miniatura PDF (magari prima pagina)
}
```

**FATTO! 5 passi, nessuna modifica ad altri componenti.**

---

## 🎨 Esempi Futuri

### Video Preview

```typescript
// preview-config.ts
video: {
  canPreview: isVideoMimeType,
  thumbnailComponent: 'VideoThumbnail',
  modalComponent: 'VideoPreviewModal'
}

// VideoPreviewModal.tsx - player HTML5 con controlli
```

### PDF Preview

```typescript
// preview-config.ts
pdf: {
  canPreview: isPDFMimeType,
  thumbnailComponent: 'PDFThumbnail',
  modalComponent: 'PDFPreviewModal'
}

// PDFPreviewModal.tsx - react-pdf o iframe embed
```

### Audio Preview

```typescript
// preview-config.ts
audio: {
  canPreview: isAudioMimeType,
  thumbnailComponent: 'AudioThumbnail',
  modalComponent: 'AudioPreviewModal'
}

// AudioPreviewModal.tsx - player audio con waveform
```

---

## 🔍 Testing Strategy

### Test Unitari

- `canPreview()` ritorna true/false correttamente
- `getPreviewType()` identifica tipo giusto
- Hook ritorna stessa interfaccia per tutti i tipi

### Test Integrazione

- Upload immagine → preview funziona
- Upload PDF → preview funziona (quando implementato)
- Upload file non-previewable → mostra solo icona
- Gallery navigation con mix di tipi
- Keyboard shortcuts in ogni viewer

### Test Regressione

- Tutte le feature immagini esistenti funzionano
- Download funziona
- Delete funziona
- Copy to clipboard funziona

---

## 💡 Note Importanti

### Cosa Mantenere

- ✅ `ImagePreviewModal` rimane invariato (funziona bene!)
- ✅ `useImagePreview` hook rimane (riusato dal wrapper)
- ✅ Tutti i controlli zoom/rotazione/navigazione esistenti

### Cosa Cambia

- 🔄 Logica condizionale centralizzata
- 🔄 Import dei modal tramite wrapper
- 🔄 Check `canPreview()` invece di `isImageMimeType()`

### Performance

- No overhead significativo (solo un check in più)
- No dynamic imports (a meno che diventi necessario)
- Caching hook invariato

### Backward Compatibility

- ✅ API esistente rimane uguale
- ✅ Props componenti invariate
- ✅ URL signed invariati
- ✅ Keyboard shortcuts invariati

---

## 🚧 Possibili Estensioni Future (se serve)

### Dynamic Imports (solo se bundle diventa pesante)

```typescript
const PDFPreviewModal = lazy(() => import('./PDFPreviewModal'));

if (previewType === 'pdf') {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PDFPreviewModal {...props} />
    </Suspense>
  );
}
```

### Hook Specifici per Tipo

```typescript
// usePDFPreview.ts
export function usePDFPreview(attachment: Attachment | null) {
  // Logica specifica PDF - es. numero pagine, text extraction
}
```

### Actions Specifiche per Tipo

```typescript
// preview-config.ts
export interface PreviewConfig {
  actions?: {
    download?: boolean;
    print?: boolean;
    copy?: boolean;
    // ...
  };
}
```

**Ma implementare solo quando diventa necessario!**

---

## 📊 Benefici del Refactoring

### Prima del Refactoring

- ❌ Aggiungere PDF: toccare 5+ componenti
- ❌ Check condizionali duplicati ovunque
- ❌ Ogni nuovo tipo = più complessità

### Dopo il Refactoring

- ✅ Aggiungere PDF: 3 file nuovi + 2 righe config
- ✅ Check centralizzato in un posto
- ✅ Ogni nuovo tipo = stessa complessità

### Metriche

- **LOC modificate:** ~200 righe
- **Tempo implementazione:** ~2.5 ore
- **Tempo aggiungere PDF (dopo):** ~1 ora
- **Tempo aggiungere PDF (prima):** ~3-4 ore
- **ROI:** Positivo dal 2° tipo aggiunto

---

## 🎯 Conclusione

Questo piano bilancia **estensibilità** e **semplicità**:

- ✅ Facile aggiungere nuovi tipi (3-5 file)
- ✅ No over-engineering (no factory pattern complessi)
- ✅ Riusa codice esistente al 100%
- ✅ Incrementale (no big rewrite)
- ✅ Testabile step-by-step

**Prossimo Step:** Implementare Step 1-5 in ordine, testando dopo ogni step.
