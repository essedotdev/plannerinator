# Cloudflare R2 Setup Guide

Guida per configurare Cloudflare R2 storage per il sistema di attachments.

## 1. Crea R2 Bucket

1. Accedi a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vai a **R2 Object Storage**
3. Clicca **Create bucket**
4. Configurazione:
   - **Bucket name:** `plannerinator-attachments` (o nome a tua scelta)
   - **Location:** Automatic (o scegli region più vicina)
5. Clicca **Create bucket**

## 2. Configura CORS (Cross-Origin Resource Sharing)

Per permettere upload diretto dal browser, configura CORS:

1. Vai al bucket appena creato
2. Clicca **Settings** → **CORS policy**
3. Aggiungi questa configurazione:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

**Nota:** Sostituisci `your-production-domain.com` con il tuo dominio di produzione.

## 3. Genera API Tokens

Per accesso programmatico a R2:

1. Vai a **R2** → **Manage R2 API Tokens**
2. Clicca **Create API token**
3. Configurazione:
   - **Token name:** `plannerinator-api`
   - **Permissions:**
     - ✅ Object Read & Write
     - ✅ Object Delete (necessario per cleanup)
   - **TTL:** No expiry (o imposta scadenza se preferisci)
   - **Bucket scope:** Apply to specific buckets only
     - Seleziona: `plannerinator-attachments`
4. Clicca **Create API Token**

5. **COPIA E SALVA** le credenziali mostrate:
   - `Access Key ID`
   - `Secret Access Key`
   - `Endpoint URL` (esempio: `https://<account-id>.r2.cloudflarestorage.com`)

⚠️ **IMPORTANTE:** Queste credenziali vengono mostrate **UNA SOLA VOLTA**. Salvale in un posto sicuro.

## 4. Configura Public Access (Opzionale)

Hai due opzioni per l'accesso ai file:

### Opzione A: Public Bucket (più semplice)

1. Vai al bucket → **Settings**
2. **Public Access** → **Allow Access**
3. Riceverai un public URL: `https://pub-<id>.r2.dev`

**Pro:** URL statici, nessun signed URL necessario
**Contro:** Chiunque con URL può accedere ai file

### Opzione B: Private Bucket + Signed URLs (raccomandato per produzione)

I file rimangono privati, generiamo URL temporanei con scadenza.

**Pro:** Sicurezza maggiore, controllo accesso
**Contro:** Più complesso, URL scadono dopo X secondi

Per Plannerinator, usiamo **Opzione B** (private + signed URLs).

## 5. Configura Environment Variables

Aggiungi al file `.env`:

```bash
# Cloudflare R2 Storage
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="plannerinator-attachments"
R2_PUBLIC_URL="https://pub-<id>.r2.dev" # Solo se usi public bucket

# Attachment Settings
MAX_FILE_SIZE_MB=10
DEFAULT_STORAGE_QUOTA_GB=1
```

**Come trovare Account ID:**

1. Dashboard Cloudflare → R2
2. L'Account ID è visibile nell'endpoint URL: `https://<account-id>.r2.cloudflarestorage.com`

## 6. Aggiungi Secrets a Wrangler (per deployment)

Per deployment su Cloudflare Workers:

```bash
# Imposta secrets per produzione
pnpm wrangler secret put R2_ACCESS_KEY_ID
pnpm wrangler secret put R2_SECRET_ACCESS_KEY

# Aggiungi variabili non-secret a wrangler.jsonc
```

Aggiorna `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "R2_ACCOUNT_ID": "your-account-id",
    "R2_BUCKET_NAME": "plannerinator-attachments",
    "MAX_FILE_SIZE_MB": "10",
    "DEFAULT_STORAGE_QUOTA_GB": "1",
  },
}
```

## 7. Lifecycle Policies (Opzionale ma raccomandato)

Per cleanup automatico di file orfani:

1. Bucket settings → **Lifecycle Rules**
2. **Add rule:**
   - **Rule name:** `cleanup-orphaned-files`
   - **Prefix:** `temp/` (per file upload temporanei)
   - **Days:** 1
   - **Action:** Delete

Questo elimina automaticamente file in `temp/` dopo 1 giorno (utile per upload falliti).

## 8. Testing

Test rapido con Wrangler CLI:

```bash
# Upload test file
echo "test" > test.txt
pnpm wrangler r2 object put plannerinator-attachments/test.txt --file=test.txt

# List objects
pnpm wrangler r2 object list plannerinator-attachments

# Download test file
pnpm wrangler r2 object get plannerinator-attachments/test.txt

# Delete test file
pnpm wrangler r2 object delete plannerinator-attachments/test.txt
```

## 9. Storage Costs

R2 Pricing (pay-as-you-go):

- **Storage:** $0.015/GB/month
- **Class A operations (write):** $4.50/million requests
- **Class B operations (read):** $0.36/million requests
- **Egress:** FREE (nessun costo bandwidth)

**Esempio calcolo:**

- 100 utenti × 1GB = 100GB → $1.50/month
- 10,000 upload/month → ~$0.05/month
- 50,000 download/month → ~$0.02/month
- **Totale: ~$1.60/month**

## 10. Security Best Practices

✅ **DO:**

- Usa bucket privati con signed URLs per dati sensibili
- Imposta CORS restrictions per domini conosciuti
- Genera API tokens con scope limitato (solo bucket necessari)
- Valida file MIME types lato server
- Scansiona file per malware (future: ClamAV integration)

❌ **DON'T:**

- Non committare API keys in repository Git
- Non usare public bucket per dati utente sensibili
- Non fidarti di MIME type inviato dal client (valida server-side)

## 11. Monitoring

Dashboard R2 mostra:

- Storage usage (GB)
- Request metrics
- Bandwidth usage
- Costs

**Alert raccomandati:**

- Storage > 80% di limite pianificato
- Request anomali (spike improvvisi)

---

## Next Steps

Dopo aver completato il setup:

1. ✅ Bucket creato
2. ✅ CORS configurato
3. ✅ API tokens generati
4. ✅ Environment variables configurate
5. ⏭️ Procedi con database migration e implementazione backend

**Support:**

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/s3/)
- [Pricing Calculator](https://www.cloudflare.com/products/r2/)
