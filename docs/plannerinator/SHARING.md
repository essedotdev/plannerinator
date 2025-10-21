# Sharing System

Sistema di condivisione entità tra utenti (Phase 4 - Futuro).

## Overview

Permettere agli utenti di condividere task, eventi, note, progetti e collection items con altri utenti registrati, con permessi granulari.

---

## Permission Levels

### View (Lettura)
- Visualizza entità e suoi dettagli
- Visualizza commenti
- Visualizza collegamenti
- **Non può:** modificare, commentare, eliminare

### Comment (Commenta)
- Tutti i permessi di View +
- Aggiungere commenti
- **Non può:** modificare entità, eliminare

### Edit (Modifica)
- Tutti i permessi di Comment +
- Modificare entità (title, description, fields, etc.)
- Aggiungere/rimuovere tags
- Creare/eliminare links
- **Non può:** eliminare entità, cambiare sharing settings, trasferire ownership

### Owner (Proprietario)
- Tutti i permessi +
- Eliminare entità
- Gestire sharing (aggiungere/rimuovere persone, cambiare permessi)
- Trasferire ownership
- Revocare tutti gli accessi

---

## Database Schema

```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner (chi condivide)
  owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,

  -- Entity being shared
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('task', 'event', 'note', 'project', 'collection_item')),
  entity_id UUID NOT NULL,

  -- Recipient (con chi è condiviso)
  shared_with_user_id TEXT REFERENCES user(id) ON DELETE CASCADE,
  shared_with_email TEXT, -- per inviti pending

  -- Permission level
  permission TEXT NOT NULL
    CHECK (permission IN ('view', 'comment', 'edit')),

  -- Share settings
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Invite token (per link condivisibili)
  invite_token TEXT UNIQUE,

  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'revoked')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,

  -- Indexes
  INDEX idx_shares_owner (owner_id),
  INDEX idx_shares_shared_with (shared_with_user_id),
  INDEX idx_shares_entity (entity_type, entity_id),
  INDEX idx_shares_token (invite_token)
);
```

---

## Share Flows

### Flow 1: Share con Utente Registrato

```
1. User A seleziona entità (es. task)
2. Click "Share" button
3. Modal: inserisce email di User B
4. Seleziona permission level (view/comment/edit)
5. Optional: imposta expiration date
6. Click "Share"

Backend:
- Verifica che User B esista
- Crea share record
- Invia notifica email a User B
- User B vede entità condivisa nella sua dashboard

User B:
- Riceve email "User A ha condiviso un task con te"
- Click link → apre task in app
- Task appare in "Shared with me" section
- Può interagire secondo permission level
```

---

### Flow 2: Share via Link (Anyone with Link)

```
1. User A seleziona entità
2. Click "Share" → "Get shareable link"
3. Seleziona permission level
4. Click "Generate link"

Backend:
- Genera unique invite_token
- Crea share record con shared_with_user_id = NULL
- Return link: https://app.com/shared/{token}

User A:
- Copia link e invia dove vuole (email, chat, etc.)

User B (non ancora registrato):
- Click link → redirect a pagina condivisione
- Se non loggato: prompt login/registrazione
- Dopo login: share viene attivato
- Entità appare in "Shared with me"
```

---

### Flow 3: Invite via Email (Pending User)

```
1. User A condivide con email non registrata
2. Share creato con status = 'pending'
3. Email inviata a indirizzo con invite link

Email ricevente:
- Click link → redirect a registrazione
- Parametri URL contengono invite_token
- Dopo registrazione: share diventa 'active'
- Entità appare automaticamente
```

---

## API Design

### Share Entity

```typescript
// features/sharing/actions.ts
'use server';

export async function shareEntity(input: {
  entityType: EntityType;
  entityId: string;
  sharedWithEmail?: string; // for specific user
  permission: 'view' | 'comment' | 'edit';
  expiresAt?: Date;
  generateLink?: boolean; // for anyone-with-link
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 1. Verify ownership
    const isOwner = await verifyOwnership(
      session.user.id,
      input.entityType,
      input.entityId
    );

    if (!isOwner) {
      return { success: false, error: 'You do not own this entity' };
    }

    // 2. If email provided, find user
    let sharedWithUserId: string | null = null;
    let status: 'pending' | 'active' = 'active';

    if (input.sharedWithEmail) {
      const recipient = await db.query.user.findFirst({
        where: eq(user.email, input.sharedWithEmail),
      });

      if (recipient) {
        sharedWithUserId = recipient.id;
      } else {
        // User doesn't exist yet, create pending share
        status = 'pending';
      }
    }

    // 3. Generate invite token if requested or if anyone-with-link
    const inviteToken = input.generateLink || !input.sharedWithEmail
      ? generateSecureToken()
      : null;

    // 4. Create share
    const [share] = await db.insert(shares).values({
      ownerId: session.user.id,
      entityType: input.entityType,
      entityId: input.entityId,
      sharedWithUserId,
      sharedWithEmail: input.sharedWithEmail,
      permission: input.permission,
      expiresAt: input.expiresAt,
      inviteToken,
      status,
    }).returning();

    // 5. Send notification email
    if (input.sharedWithEmail) {
      await sendShareInviteEmail({
        recipientEmail: input.sharedWithEmail,
        ownerName: session.user.name,
        entityType: input.entityType,
        permission: input.permission,
        inviteToken: inviteToken!,
      });
    }

    // 6. Revalidate
    revalidatePath(`/${input.entityType}s/${input.entityId}`);

    return {
      success: true,
      data: {
        share,
        shareLink: inviteToken
          ? `${process.env.NEXT_PUBLIC_APP_URL}/shared/${inviteToken}`
          : null,
      },
    };
  } catch (error) {
    console.error('Share entity error:', error);
    return { success: false, error: 'Failed to share entity' };
  }
}
```

---

### Update Share Permission

```typescript
export async function updateSharePermission(
  shareId: string,
  permission: 'view' | 'comment' | 'edit'
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify ownership of share
    const share = await db.query.shares.findFirst({
      where: and(
        eq(shares.id, shareId),
        eq(shares.ownerId, session.user.id)
      ),
    });

    if (!share) {
      return { success: false, error: 'Share not found' };
    }

    // Update
    const [updated] = await db.update(shares)
      .set({ permission, updatedAt: new Date() })
      .where(eq(shares.id, shareId))
      .returning();

    revalidatePath(`/${share.entityType}s/${share.entityId}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error('Update share error:', error);
    return { success: false, error: 'Failed to update share' };
  }
}
```

---

### Revoke Share

```typescript
export async function revokeShare(shareId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const share = await db.query.shares.findFirst({
      where: and(
        eq(shares.id, shareId),
        eq(shares.ownerId, session.user.id)
      ),
    });

    if (!share) {
      return { success: false, error: 'Share not found' };
    }

    // Set status to revoked instead of deleting (for audit trail)
    await db.update(shares)
      .set({ status: 'revoked', updatedAt: new Date() })
      .where(eq(shares.id, shareId));

    revalidatePath(`/${share.entityType}s/${share.entityId}`);

    return { success: true, data: { id: shareId } };
  } catch (error) {
    console.error('Revoke share error:', error);
    return { success: false, error: 'Failed to revoke share' };
  }
}
```

---

### Accept Share (via Token)

```typescript
export async function acceptShareInvite(token: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Please login to accept share' };
  }

  try {
    const share = await db.query.shares.findFirst({
      where: and(
        eq(shares.inviteToken, token),
        eq(shares.status, 'pending')
      ),
    });

    if (!share) {
      return { success: false, error: 'Invalid or expired invite' };
    }

    // Check expiration
    if (share.expiresAt && share.expiresAt < new Date()) {
      return { success: false, error: 'Invite has expired' };
    }

    // Activate share
    const [updated] = await db.update(shares)
      .set({
        sharedWithUserId: session.user.id,
        status: 'active',
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shares.id, share.id))
      .returning();

    return { success: true, data: updated };
  } catch (error) {
    console.error('Accept share error:', error);
    return { success: false, error: 'Failed to accept share' };
  }
}
```

---

## Query Modifications

### Get Entity with Permission Check

```typescript
export async function getTask(id: string) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Check if user is owner or has share access
  const permission = await getEntityPermission(
    session.user.id,
    'task',
    id
  );

  if (permission === null) {
    throw new Error('Access denied');
  }

  return {
    task,
    permission, // 'owner' | 'view' | 'comment' | 'edit'
    isOwner: task.userId === session.user.id,
  };
}

async function getEntityPermission(
  userId: string,
  entityType: string,
  entityId: string
): Promise<'owner' | 'view' | 'comment' | 'edit' | null> {
  // Check ownership
  const entity = await getEntityByTypeAndId(entityType, entityId);
  if (entity?.userId === userId) {
    return 'owner';
  }

  // Check share
  const share = await db.query.shares.findFirst({
    where: and(
      eq(shares.entityType, entityType),
      eq(shares.entityId, entityId),
      eq(shares.sharedWithUserId, userId),
      eq(shares.status, 'active')
    ),
  });

  if (!share) {
    return null;
  }

  // Check expiration
  if (share.expiresAt && share.expiresAt < new Date()) {
    return null;
  }

  return share.permission as 'view' | 'comment' | 'edit';
}
```

---

### Get Shared Entities

```typescript
export async function getSharedWithMe() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const activeShares = await db.query.shares.findMany({
    where: and(
      eq(shares.sharedWithUserId, session.user.id),
      eq(shares.status, 'active')
    ),
    with: {
      owner: true, // Include owner info
    },
  });

  // Fetch actual entities
  const entities = await Promise.all(
    activeShares.map(async (share) => {
      const entity = await getEntityByTypeAndId(
        share.entityType,
        share.entityId
      );

      return {
        ...entity,
        shareInfo: {
          sharedBy: share.owner.name,
          permission: share.permission,
          sharedAt: share.createdAt,
        },
      };
    })
  );

  return entities;
}
```

---

## UI Components

### Share Button

```typescript
function ShareButton({ entityType, entityId }: {
  entityType: EntityType;
  entityId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      <ShareDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        entityType={entityType}
        entityId={entityId}
      />
    </>
  );
}
```

---

### Share Dialog

```typescript
function ShareDialog({ entityType, entityId, open, onOpenChange }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');
  const [shareLink, setShareLink] = useState<string | null>(null);

  const { data: existingShares } = useQuery({
    queryKey: ['shares', entityType, entityId],
    queryFn: () => getEntityShares(entityType, entityId),
  });

  async function handleShare() {
    const result = await shareEntity({
      entityType,
      entityId,
      sharedWithEmail: email,
      permission,
    });

    if (result.success) {
      toast.success('Shared successfully');
      setEmail('');
    } else {
      toast.error(result.error);
    }
  }

  async function handleGenerateLink() {
    const result = await shareEntity({
      entityType,
      entityId,
      permission,
      generateLink: true,
    });

    if (result.success) {
      setShareLink(result.data.shareLink);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {entityType}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share with specific user */}
          <div>
            <Label>Share with</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleShare}>Share</Button>
            </div>
          </div>

          <Separator />

          {/* Generate shareable link */}
          <div>
            <Label>Anyone with the link</Label>
            <div className="flex gap-2 mt-2">
              {!shareLink ? (
                <Button variant="outline" onClick={handleGenerateLink}>
                  <Link className="h-4 w-4 mr-2" />
                  Get shareable link
                </Button>
              ) : (
                <div className="flex gap-2 w-full">
                  <Input value={shareLink} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.success('Link copied');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Existing shares list */}
          <div>
            <Label>People with access</Label>
            <div className="mt-2 space-y-2">
              {existingShares?.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {share.sharedWithUser?.name || share.sharedWithEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {share.permission}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={share.permission}
                      onValueChange={(p) => updateSharePermission(share.id, p)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="comment">Comment</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revokeShare(share.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Shared Badge

```typescript
// Mostra badge su entità condivise
function SharedBadge({ shareCount }: { shareCount: number }) {
  return (
    <Badge variant="secondary">
      <Users className="h-3 w-3 mr-1" />
      Shared with {shareCount}
    </Badge>
  );
}
```

---

## Permission Guards

### Component-level Guard

```typescript
function TaskActions({ task, permission }: {
  task: Task;
  permission: 'owner' | 'view' | 'comment' | 'edit';
}) {
  return (
    <div className="flex gap-2">
      {/* View permission: no actions */}

      {/* Comment permission: can comment */}
      {['comment', 'edit', 'owner'].includes(permission) && (
        <Button onClick={openComments}>
          <MessageSquare className="h-4 w-4" />
        </Button>
      )}

      {/* Edit permission: can modify */}
      {['edit', 'owner'].includes(permission) && (
        <Button onClick={openEditDialog}>
          <Edit className="h-4 w-4" />
        </Button>
      )}

      {/* Owner permission: can delete */}
      {permission === 'owner' && (
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

---

## Notifications

### Email Templates

**Share Invite:**
```
Subject: [User Name] shared a [entity] with you

Hi [Recipient Name],

[Owner Name] has shared a [entity type] with you on Plannerinator.

Entity: [Entity Title]
Permission: [view/comment/edit]

[View Entity Button]

This share will expire on [expiration date] if set.
```

**Share Accepted:**
```
Subject: [User Name] accepted your share

Hi [Owner Name],

[Recipient Name] has accepted your share of "[Entity Title]".

[View Entity Button]
```

---

## Security Considerations

1. **Permission Checks:**
   - Ogni Server Action deve verificare permessi
   - Non fidarsi di client-side checks

2. **Token Security:**
   - Invite tokens devono essere cryptographically secure
   - Use `crypto.randomBytes(32).toString('hex')`

3. **Expiration:**
   - Check expiration su ogni accesso
   - Automatic cleanup di shares scaduti (cron job)

4. **Cascading Permissions:**
   - Se share project → user vede anche tasks del project?
   - Decisione: NO, shares sono per entità singola
   - Futuro: opzione "share with sub-items"

5. **Audit Trail:**
   - Log tutte le share actions in activity_log
   - Chi ha condiviso cosa, quando

---

## Future Enhancements

1. **Workspace Sharing:**
   - Share intero workspace con team
   - Shared collections/projects con permessi ereditati

2. **Public Sharing:**
   - Entità pubbliche senza login required
   - SEO-friendly URLs

3. **Real-time Collaboration:**
   - Vedi chi sta visualizzando/editando
   - Cursor presence (come Google Docs)

4. **Share Analytics:**
   - Quante volte è stato visto
   - Chi ha interagito

5. **Bulk Sharing:**
   - Share multiple entities contemporaneamente
   - Share templates
