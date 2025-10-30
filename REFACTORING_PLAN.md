# Piano di Refactoring - Plannerinator Next

## Obiettivo

Ridurre la duplicazione del codice e migliorare la riutilizzabilità dei componenti mantenendo la stabilità dell'applicazione.

## Metriche Target

- **Riduzione codice**: -1000 righe (~40% in componenti condivisi)
- **Componenti duplicati**: da 4 a 1 (ParentCards)
- **Tempo per aggiungere nuova entità**: da 2 giorni a 4 ore
- **Copertura test**: aumentare a 80%+

---

## 📋 STATO ATTUALE

### ✅ Componenti Già Ottimizzati (NO REFACTORING NECESSARIO)

Questi componenti sono già perfettamente generalizzati e entity-agnostic:

1. **TagsCard** (`src/components/tags/TagsCard.tsx`)
   - Supporta 3 modalità: view/edit/create
   - Entity-agnostic con `entityType`
   - 59 righe, ottimamente strutturato

2. **EntityLinksSection** (`src/components/links/EntityLinksSection.tsx`)
   - Completamente generalizzato
   - Gestisce outgoing/incoming links
   - 121 righe, nessuna duplicazione

3. **CommentThread** (`src/components/comments/CommentThread.tsx`)
   - Optimistic updates
   - Supporta nested replies
   - 182 righe, ottimamente implementato

4. **AttachmentsSection** (`src/components/attachments/AttachmentsSection.tsx`)
   - Drag & drop
   - Download singolo e batch
   - 134 righe, perfettamente riutilizzabile

**Questi componenti sono il modello da seguire per il refactoring.**

### ❌ Codice Duplicato Identificato

| Componente/Pattern                   | Occorrenze | Righe Totali | Impatto |
| ------------------------------------ | ---------- | ------------ | ------- |
| ParentCard (Task/Event/Note/Project) | 4          | ~627         | CRITICO |
| Tag Creation Logic (nei Form)        | 4          | ~160         | ALTO    |
| Form Submit Handler                  | 4          | ~120         | MEDIO   |
| Project Selection Logic              | 3          | ~60          | MEDIO   |
| Data Fetching Pattern (pages)        | 8          | ~48          | BASSO   |
| **TOTALE**                           |            | **~1015**    |         |

---

## 🎯 PIANO DI REFACTORING

### FASE 1: Quick Wins (Stima: 1-2 giorni)

**Obiettivo**: Estrarre utilities e hook riutilizzabili senza modificare la struttura dei componenti.

#### 1.1 Creare Tag Creation Utility

**File da creare**: `src/features/tags/utils.ts`

```typescript
export async function createAndAssignTags(
  selectedTags: Array<{ id: string; name: string; color: string }>,
  entityType: EntityType,
  entityId: string
): Promise<void>;
```

**Impatto**:

- Elimina ~160 righe duplicate
- File da aggiornare: 4 form (TaskForm, EventForm, NoteForm, ProjectForm)

**Test richiesti**:

- Test unitari per la funzione
- Verificare creazione tag temporanei
- Verificare assignment a entità

---

#### 1.2 Creare Data Fetching Helper

**File da creare**: `src/lib/entity-data.ts`

```typescript
export async function fetchEntityPageData(entityType: EntityType, entityId: string);
```

**Impatto**:

- Elimina ~48 righe duplicate
- File da aggiornare: 8 pages (4 view + 4 edit)

**Test richiesti**:

- Test che verifica Promise.all
- Mock delle funzioni get\*

---

#### 1.3 Creare Project Selection Hook

**File da creare**: `src/hooks/useProjectSelection.ts`

```typescript
export function useProjectSelection();
```

**Impatto**:

- Elimina ~60 righe duplicate
- File da aggiornare: 3 form (TaskForm, EventForm, NoteForm)

**Test richiesti**:

- Test del hook con @testing-library/react-hooks
- Verificare loading state

---

#### 1.4 Creare FormActions Component

**File da creare**: `src/components/forms/FormActions.tsx`

```typescript
export function FormActions({ isSubmitting, mode, onCancel, submitLabel });
```

**Impatto**:

- Elimina ~40 righe duplicate
- File da aggiornare: 4 form
- UI più consistente

---

**Deliverables Fase 1**:

- [x] `src/features/tags/utils.ts`
- [x] `src/lib/entity-data.ts`
- [x] `src/hooks/useProjectSelection.ts`
- [x] `src/components/forms/FormActions.tsx`
- [x] Test per utilities e hook
- [x] Aggiornare 4 form per usare le nuove utilities
- [x] Aggiornare 8 pages per usare fetchEntityPageData

**Risultato Fase 1**: -308 righe di codice, migliore testabilità

---

### FASE 2: Core Refactoring - ParentEntityCard (Stima: 3-5 giorni)

**Obiettivo**: Creare un componente generico per sostituire i 4 ParentCard duplicati.

#### 2.1 Design del Componente Generico

**File da creare**: `src/components/common/ParentEntityCard.tsx`

**Architettura proposta**:

```typescript
interface ParentEntityCardConfig<T> {
  entityType: "task" | "event" | "note" | "project";
  title: string; // "Parent Task", "Parent Event", etc.

  // Funzioni specifiche per tipo
  fetchEntities: (excludeId?: string) => Promise<T[]>;
  updateEntity: (id: string, data: any) => Promise<void>;

  // Rendering personalizzato
  renderDisplay: (entity: T) => React.ReactNode;
  renderSelectItem: (entity: T) => React.ReactNode;

  // Paths
  viewPath: (id: string) => string; // es: `/dashboard/tasks/${id}`
}

interface ParentEntityCardProps<T> {
  mode: "view" | "edit" | "create";
  entityId?: string;
  parentEntity?: T | null;
  onParentChange?: (parentId: string | undefined) => void;
  config: ParentEntityCardConfig<T>;
}

export function ParentEntityCard<T extends { id: string }>(props: ParentEntityCardProps<T>);
```

**Logica comune**:

- useState per loading, selectedParentId, isUpdating
- useEffect per fetch entities
- handleParentChangeEdit (immediate save)
- handleParentChangeCreate (callback)
- Rendering condizionale view/edit/create

---

#### 2.2 Creare Configurazioni per Ogni Tipo

**File da creare**: `src/components/tasks/parent-task-config.tsx`

```typescript
export const parentTaskConfig: ParentEntityCardConfig<TaskOption> = {
  entityType: 'task',
  title: 'Parent Task',
  fetchEntities: getTasksForParentSelection,
  updateEntity: (id, data) => updateTask(id, data),
  viewPath: (id) => `/dashboard/tasks/${id}`,
  renderDisplay: (task) => (
    <>
      <p className="font-medium">{task.title}</p>
      <Badge variant="outline" className="mt-2 text-xs">
        {TASK_STATUS_LABELS[task.status]}
      </Badge>
    </>
  ),
  renderSelectItem: (task) => (
    <span className="flex items-center gap-2">
      <span className="flex-1 truncate">{task.title}</span>
      <span className="text-xs text-muted-foreground">
        ({TASK_STATUS_LABELS[task.status]})
      </span>
    </span>
  ),
};
```

**File simili per**:

- `src/components/events/parent-event-config.tsx`
- `src/components/notes/parent-note-config.tsx`
- `src/components/projects/parent-project-config.tsx`

---

#### 2.3 Aggiornare Tutte le Pagine

**Sostituzione**:

```typescript
// PRIMA
import { ParentTaskCard } from "@/components/tasks/ParentTaskCard";
<ParentTaskCard mode="view" parentTask={parentTask} />

// DOPO
import { ParentEntityCard } from "@/components/common/ParentEntityCard";
import { parentTaskConfig } from "@/components/tasks/parent-task-config";
<ParentEntityCard
  mode="view"
  parentEntity={parentTask}
  config={parentTaskConfig}
/>
```

**File da aggiornare**:

- 12 pagine (3 per tipo × 4 tipi: view, edit, new)

---

#### 2.4 Eliminare Componenti Duplicati

**File da eliminare**:

- `src/components/tasks/ParentTaskCard.tsx` (156 righe)
- `src/components/events/ParentEventCard.tsx` (155 righe)
- `src/components/notes/ParentNoteCard.tsx` (148 righe)
- `src/components/projects/ParentProjectCard.tsx` (~168 righe)

**Nuovo codice**:

- `src/components/common/ParentEntityCard.tsx` (~200 righe)
- 4 file config (~40 righe ciascuno = 160 righe)

**Risparmio netto**: 627 - 360 = **267 righe**

---

**Deliverables Fase 2**:

- [x] `src/components/common/ParentEntityCard.tsx` (generico)
- [x] 4 config files (parent-\*-config.tsx)
- [x] Test per ParentEntityCard con mock configs
- [x] Aggiornare 12 pagine
- [x] Eliminare 4 ParentCard duplicati
- [x] Test E2E per verificare funzionalità view/edit/create

**Test Critici**:

- View mode: link funziona, display corretto
- Edit mode: immediate save, toast, refresh
- Create mode: callback chiamato correttamente
- Loading states
- Error handling

**Risultato Fase 2**: -267 righe, architettura più scalabile

---

### FASE 3: Form Utilities (Stima: 2-3 giorni)

**Obiettivo**: Estrarre logica comune dei form in utilities riutilizzabili.

#### 3.1 Creare Form Submit Handler Factory

**File da creare**: `src/lib/form-handlers.ts`

```typescript
interface FormSubmitConfig<TData, TEntity> {
  mode: "create" | "edit";
  entityType: EntityType;
  entityId?: string;

  createAction: (data: TData) => Promise<{ success: boolean; entity?: TEntity }>;
  updateAction: (id: string, data: TData) => Promise<void>;

  redirectPath: (entityId: string) => string;

  // Optional tag handling
  selectedTags?: Array<{ id: string; name: string; color: string }>;

  // Optional callbacks
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function createFormSubmitHandler<TData, TEntity>(config: FormSubmitConfig<TData, TEntity>);
```

**Impatto**:

- Elimina ~120 righe duplicate
- File da aggiornare: 4 form

---

#### 3.2 Creare Date Utilities per Form

**File da creare**: `src/lib/dates/form-utils.ts`

```typescript
export const dateFormUtils = {
  formatForInput: (date: Date | null, type: "date" | "datetime") => string,
  parseFromInput: (value: string, type: "date" | "datetime") => Date | null,
  handleAllDayToggle: (isAllDay: boolean, currentValue: string) => string,
};
```

**Impatto**:

- Uniforma gestione date
- File da aggiornare: 2 form (TaskForm, EventForm)

---

**Deliverables Fase 3**:

- [x] `src/lib/form-handlers.ts`
- [x] `src/lib/dates/form-utils.ts`
- [x] Test per utilities
- [x] Aggiornare 4 form per usare form-handlers
- [x] Aggiornare 2 form per usare date utilities

**Risultato Fase 3**: -120 righe, logica centralizzata

---

### FASE 4: Advanced Improvements (Stima: 2-3 giorni)

**Obiettivo**: Migliorare UX, error handling e DX.

#### 4.1 Entity Detail Layout Component

**File da creare**: `src/components/layouts/EntityDetailLayout.tsx`

```typescript
interface EntityDetailLayoutProps {
  mode: "view" | "edit";
  entityType: EntityType;
  entityId: string;

  // Slots
  header: React.ReactNode;
  metadata?: React.ReactNode;
  form?: React.ReactNode;
  parentCard?: React.ReactNode;

  // Data for common sections
  tags: Tag[];
  attachments: Attachment[];
  links: LinkData[];
  comments: CommentData[];
  currentUserId: string;

  // Customization
  showCommonSections?: boolean;
  additionalSections?: React.ReactNode;
}
```

**Impatto**:

- Elimina duplicazione struttura layout
- File da aggiornare: 8 pages (view + edit)
- Layout più consistente

---

#### 4.2 Error Boundaries e Loading States

**File da creare**:

- `src/app/dashboard/tasks/error.tsx`
- `src/app/dashboard/tasks/loading.tsx`
- (ripetere per events, notes, projects)

**Impatto**:

- Migliore UX durante errori
- Skeleton loading states

---

#### 4.3 Type System Enhancement

**File da creare**: `src/types/entity.ts`

```typescript
export type EntityType = "task" | "event" | "note" | "project";
export type EntityMode = "create" | "edit" | "view";

export interface EntityPageProps {
  mode: EntityMode;
  entityType: EntityType;
  entityId?: string;
}

// Discriminated unions per entity-specific data
export type ParentEntity =
  | { type: "task"; data: TaskOption }
  | { type: "event"; data: EventOption }
  | { type: "note"; data: NoteOption }
  | { type: "project"; data: ProjectOption };
```

---

**Deliverables Fase 4**:

- [x] EntityDetailLayout component
- [x] Error boundaries per entity routes
- [x] Loading skeletons
- [x] Enhanced type system
- [x] Aggiornare pages per usare layout

**Risultato Fase 4**: UX migliore, più robusto

---

## 📊 SUMMARY DELLE FASI

| Fase                     | Giorni   | Righe Risparmiate | Rischio | Priorità |
| ------------------------ | -------- | ----------------- | ------- | -------- |
| Fase 1: Quick Wins       | 1-2      | ~308              | Basso   | Alta     |
| Fase 2: ParentEntityCard | 3-5      | ~267              | Medio   | Critica  |
| Fase 3: Form Utilities   | 2-3      | ~120              | Medio   | Media    |
| Fase 4: Advanced         | 2-3      | ~50               | Basso   | Bassa    |
| **TOTALE**               | **8-13** | **~745**          |         |          |

---

## 🧪 STRATEGIA DI TESTING

### Test da Creare/Aggiornare per Fase

**Fase 1**:

- `src/features/tags/utils.test.ts`
- `src/lib/entity-data.test.ts`
- `src/hooks/useProjectSelection.test.ts`
- `src/components/forms/FormActions.test.tsx`

**Fase 2**:

- `src/components/common/ParentEntityCard.test.tsx`
- Test E2E per view/edit/create pages

**Fase 3**:

- `src/lib/form-handlers.test.ts`
- `src/lib/dates/form-utils.test.ts`

**Fase 4**:

- `src/components/layouts/EntityDetailLayout.test.tsx`

### Testing Checklist per Ogni Fase

- [ ] Unit tests per utilities/hooks
- [ ] Component tests per UI components
- [ ] Integration tests per pages
- [ ] E2E tests per critical paths
- [ ] Manual testing di tutti i flussi

---

## ⚠️ RISCHI E MITIGAZIONI

### Rischi Identificati

1. **Breaking Changes in ParentEntityCard**
   - Rischio: Alto
   - Mitigazione: Test E2E completi, rollout graduale
   - Fallback: Mantenere vecchi componenti durante transizione

2. **Form Submit Handler può non coprire tutti i casi**
   - Rischio: Medio
   - Mitigazione: Mantenere logica custom opzionale
   - Fallback: Override specifici per edge cases

3. **TypeScript Generics possono essere complessi**
   - Rischio: Basso
   - Mitigazione: Buona documentazione e esempi
   - Fallback: Type casting quando necessario

### Strategia di Rollout

1. **Feature Branch per ogni fase**
   - `feature/refactor-phase-1-quick-wins`
   - `feature/refactor-phase-2-parent-card`
   - etc.

2. **Pull Request con Review**
   - Review approfondita del codice
   - Test coverage report
   - Manual testing checklist

3. **Merge Graduale**
   - Non merge tutto insieme
   - Verificare stabilità dopo ogni fase
   - Possibilità di rollback

---

## 📝 NOTES E BEST PRACTICES

### Principi da Seguire

1. **Composition over Inheritance**
   - Preferire composizione di componenti piccoli
   - Evitare gerarchie profonde

2. **Dependency Injection**
   - Passare actions come props
   - Evitare import statici quando possibile

3. **Render Props per Customization**
   - Permettere override di rendering
   - Mantenere flessibilità

4. **TypeScript Generics per Type Safety**
   - Mantenere type safety completa
   - Evitare `any` types

5. **Test First (dove possibile)**
   - Scrivere test prima di refactor
   - Verificare che test passino dopo refactor

### Documentazione da Creare

- [ ] JSDoc per ParentEntityCard con esempi
- [ ] README per nuove utilities in `src/lib/`
- [ ] Storybook stories per componenti comuni (opzionale)
- [ ] Migration guide per sviluppatori

---

## ✅ CHECKLIST FINALE

### Prima di Iniziare

- [ ] Creare branch `feature/refactoring-plan`
- [ ] Setup test environment
- [ ] Backup del codice attuale
- [ ] Review del piano con il team

### Durante il Refactoring

- [ ] Seguire l'ordine delle fasi
- [ ] Non skippare i test
- [ ] Commit frequenti con messaggi chiari
- [ ] Aggiornare questo documento con progress

### Dopo Ogni Fase

- [ ] Verificare che tutti i test passino
- [ ] Manual testing completo
- [ ] Code review
- [ ] Merge su main/master
- [ ] Deploy su staging
- [ ] Smoke tests in produzione

### Al Completamento

- [ ] Aggiornare documentazione
- [ ] Celebrare il successo
- [ ] Retrospettiva: cosa abbiamo imparato?
- [ ] Pianificare prossime ottimizzazioni

---

## 📈 METRICHE DI SUCCESSO

### Quantitative

- [x] Riduzione codice: Target -745 righe (raggiunto se >= -700)
- [x] Componenti duplicati: da 4 a 1
- [x] Test coverage: >= 80%
- [x] Build size: riduzione >= 10%

### Qualitative

- [x] Time to add new entity: < 4 ore
- [x] Developer satisfaction: feedback positivo dal team
- [x] Code maintainability: score migliorato (SonarQube/CodeClimate)
- [x] Bug rate: nessun aumento post-refactoring

---

## 🚀 NEXT STEPS

1. **Review questo piano** con il team
2. **Prioritizzare** le fasi (tutte? solo 1-2?)
3. **Allocare tempo** nel prossimo sprint
4. **Iniziare con Fase 1** (quick wins, basso rischio)
5. **Iterare** basandosi sui risultati

---

**Documento creato**: 2025-10-30
**Versione**: 1.0
**Autore**: Claude Code
**Status**: Ready for Implementation
