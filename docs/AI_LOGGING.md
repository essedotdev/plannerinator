# AI Assistant Logging System

Sistema completo di logging per debugging e monitoraggio dell'AI assistant.

## 📋 Panoramica

Il sistema di logging traccia tutte le operazioni dell'AI:
- **Tool calls** - Quali funzioni vengono chiamate e con quali parametri
- **Database queries** - Query eseguite e risultati ottenuti
- **API calls** - Chiamate a OpenRouter e risposte ricevute
- **Errori** - Stack trace completi per debugging

## 🎯 Problema Risolto

**Problema originale:** "Vedo note nella UI ma l'AI dice che non ci sono note"

**Causa:** L'AI usava `search_entities` che richiede una query testuale. Quando chiedevi "mostrami le ultime note", il modello doveva inventare una query di ricerca invece di fare una lista diretta.

**Soluzione:**
1. Nuovo tool `query_entities` per liste dirette senza ricerca testuale
2. Logging completo per capire esattamente cosa accede l'AI

## 🔧 Configurazione

### Variabili d'ambiente

```env
# Console logging (sempre attivo di default)
AI_LOGGING_ENABLED=true

# Database logging (opzionale, utile per produzione)
AI_DB_LOGGING_ENABLED=true
```

## 📊 Livelli di Log

| Livello | Colore | Uso |
|---------|--------|-----|
| `DEBUG` | 🔵 Cyan | Query DB, dettagli API |
| `INFO` | 🟢 Green | Tool calls, operazioni riuscite |
| `WARNING` | 🟡 Yellow | Operazioni fallite, dati mancanti |
| `ERROR` | 🔴 Red | Eccezioni, errori critici |

## 📝 Esempi di Log

### Tool Call Log

```
[AI INFO] 2025-01-07T10:30:45.123Z
🔧 Tool called: query_entities
Context: {
  "userId": "user_123",
  "conversationId": "conv_456",
  "toolName": "query_entities",
  "input": {
    "entityTypes": ["note"],
    "limit": 10,
    "sortBy": "updatedAt",
    "sortOrder": "desc"
  }
}
```

### Database Query Log

```
[AI DEBUG] 2025-01-07T10:30:45.456Z
🗄️ Database query: SELECT on note
Context: {
  "userId": "user_123",
  "operation": "SELECT",
  "table": "note",
  "conditions": [...],
  "resultCount": 5
}
```

### Search Results Log

```
[AI INFO] 2025-01-07T10:30:45.789Z
🔍 Search executed: ""
Context: {
  "query": "",
  "entityTypes": ["note"],
  "resultCounts": {
    "notes": 5,
    "tasks": 0,
    "events": 0,
    "projects": 0,
    "total": 5
  },
  "sampleResults": {
    "notes": [
      { "id": "note_1", "title": "My First Note", ... },
      { "id": "note_2", "title": "Meeting Notes", ... }
    ]
  }
}
```

### Tool Result Log

```
[AI INFO] 2025-01-07T10:30:46.012Z
✅ Tool result: query_entities (323ms)
Context: {
  "executionTimeMs": 323,
  "result": {
    "success": true,
    "data": {
      "total": 5,
      "results": { ... }
    }
  }
}
```

## 🆕 Nuovi Tool Disponibili

### `query_entities` (NUOVO)

**Quando usarlo:** Liste dirette senza ricerca testuale

**Esempi:**
- "Mostrami le mie note"
- "Lista tutte le task"
- "Quali sono i miei progetti recenti?"
- "Ultime 20 note"

**Vantaggi:**
- Più veloce (no ricerca testuale)
- Più affidabile (query diretta al DB)
- Ordinamento personalizzabile
- Filtri avanzati

```typescript
// Esempio di chiamata
{
  "entityTypes": ["note", "task"],
  "filters": {
    "status": "active",
    "priority": "high"
  },
  "sortBy": "updatedAt",
  "sortOrder": "desc",
  "limit": 10
}
```

### `search_entities` (ESISTENTE)

**Quando usarlo:** Ricerca testuale specifica

**Esempi:**
- "Trova note che contengono 'API'"
- "Cerca task con 'meeting'"
- "Note su React"

## 🐛 Debug Workflow

### 1. Problema: "L'AI non vede i miei dati"

**Step di debug:**

1. **Controlla i log della console:**
```bash
# Cerca log tipo:
[AI INFO] 📋 Executing query_entities
[AI DEBUG] 🗄️ Database query: SELECT on note
```

2. **Verifica resultCount:**
```bash
# Se vedi resultCount: 0, il problema è nel DB
# Se vedi resultCount: 5, il problema è nella risposta dell'AI
```

3. **Controlla le conditions:**
```bash
# Verifica che userId sia corretto
# Verifica che i filtri siano applicati correttamente
```

### 2. Problema: "L'AI chiama il tool sbagliato"

**Cerca nei log:**
```bash
[AI INFO] 🔧 Tool called: search_entities
# ❌ Sbagliato per "mostrami note"
# Dovrebbe usare query_entities

[AI INFO] 🔧 Tool called: query_entities
# ✅ Corretto
```

**Soluzione:** Modifica la description del tool in `src/lib/ai/functions.ts`

### 3. Problema: "Query troppo lente"

**Cerca execution time:**
```bash
[AI INFO] ✅ Tool result: query_entities (2345ms)
# Se > 1000ms, ottimizzare query o aggiungere indici
```

## 📈 Log nel Database

Se attivi `AI_DB_LOGGING_ENABLED=true`, tutti i log vengono salvati nella tabella `ai_log`:

```sql
SELECT
  level,
  message,
  metadata->>'toolName' as tool,
  metadata->>'resultCount' as results,
  created_at
FROM ai_log
WHERE user_id = 'user_123'
  AND conversation_id = 'conv_456'
ORDER BY created_at DESC
LIMIT 50;
```

### Query Utili

**Tool calls per conversazione:**
```sql
SELECT
  metadata->>'toolName' as tool,
  COUNT(*) as calls,
  AVG((metadata->>'executionTimeMs')::int) as avg_ms
FROM ai_log
WHERE conversation_id = 'conv_456'
  AND metadata->>'toolName' IS NOT NULL
GROUP BY tool;
```

**Errori recenti:**
```sql
SELECT
  message,
  metadata->>'error' as error_msg,
  metadata->>'stack' as stack_trace,
  created_at
FROM ai_log
WHERE level = 'ERROR'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## 🎓 Best Practices

### 1. Monitoraggio in Sviluppo

```env
AI_LOGGING_ENABLED=true
AI_DB_LOGGING_ENABLED=false  # Console only
```

### 2. Monitoraggio in Produzione

```env
AI_LOGGING_ENABLED=true
AI_DB_LOGGING_ENABLED=true  # Salva nel DB per analisi
```

### 3. Performance

- Console logging ha overhead minimo (~5-10ms)
- DB logging ha overhead maggiore (~50-100ms)
- Usa DB logging solo se necessario

### 4. Privacy

I log contengono:
- ✅ User IDs (necessario per debug)
- ✅ Query parameters
- ✅ Tool inputs/outputs
- ❌ **NO password o dati sensibili**

### 5. Retention

```sql
-- Pulisci log vecchi (esempio: > 30 giorni)
DELETE FROM ai_log
WHERE created_at < NOW() - INTERVAL '30 days';
```

## 🔍 Casi d'uso Comuni

### Caso 1: Verificare cosa vede l'AI

**Domanda utente:** "Mostrami le mie note"

**Log da cercare:**
```bash
# 1. Tool call
[AI INFO] 🔧 Tool called: query_entities
{ "entityTypes": ["note"], "limit": 10 }

# 2. Database query
[AI DEBUG] 🗄️ Database query: SELECT on note
{ "resultCount": 5 }

# 3. Results
[AI INFO] ✅ query_entities completed
{ "total": 5, "breakdown": { "notes": 5 } }
```

### Caso 2: Debug search vs query

**Problema:** L'AI non trova dati esistenti

**Controlla quale tool usa:**
- Se usa `search_entities` con query vuota → PROBLEMA
- Se usa `query_entities` → OK

**Fix:** Aggiorna la description in `functions.ts` per chiarire quando usare ciascun tool

### Caso 3: Performance monitoring

**Query lente:**
```bash
grep "executionTimeMs" logs.txt | awk '{print $NF}' | sort -n
# Se vedi valori > 1000ms, indaga
```

## 📦 File Modificati

- `src/lib/ai/logger.ts` - Logger principale
- `src/db/schema.ts` - Tabella `ai_log`
- `src/features/ai/tool-handlers.ts` - Log in tutti i tool
- `src/features/ai/actions.ts` - Log chiamate API
- `src/lib/ai/functions.ts` - Nuovo tool `query_entities`
- `src/features/ai/types.ts` - Tipo `QueryEntitiesInput`

## 🚀 Next Steps

1. ✅ Sistema di logging funzionante
2. ✅ Tool `query_entities` implementato
3. 🔜 Dashboard per visualizzare log (opzionale)
4. 🔜 Alert automatici su errori (opzionale)
5. 🔜 Metriche aggregate (opzionale)

## 💡 Tips

1. **Grep amico:** `grep "🔧 Tool called" logs.txt` per vedere tutti i tool calls
2. **JSON pretty-print:** I log hanno JSON ben formattato, usa `jq` per parsing
3. **Timestamp precisi:** Tutti i log hanno timestamp ISO 8601
4. **Context completo:** Ogni log ha userId e conversationId per tracciabilità

---

**Domande?** Controlla i log prima! 99% dei problemi sono visibili nei log. 🎯
