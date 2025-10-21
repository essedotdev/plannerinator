# AI Assistant

Integrazione AI assistant conversazionale per Plannerinator (Phase 5 - Futuro).

## Vision

Un assistente AI che permette di gestire la propria vita tramite linguaggio naturale:
- Crea, modifica, elimina entità via chat
- Cerca informazioni complesse
- Suggerimenti intelligenti
- Multi-entity operations
- Context-aware

---

## Architecture

### High-Level Flow

```
User Input (Chat)
    ↓
Frontend Chat Component
    ↓
Server Action (parseUserMessage)
    ↓
LLM API (OpenAI/Anthropic) con Function Calling
    ↓
Extract structured actions + parameters
    ↓
Validation (Zod schemas)
    ↓
Execute Server Actions (create/update/delete/search)
    ↓
Return result to chat
    ↓
Stream response to UI
```

---

## LLM Choice

### Option 1: OpenAI GPT-4o ✅ Raccomandato
**Pros:**
- Function calling maturo e affidabile
- Eccellente per italiano
- Streaming response
- Costo: ~$0.01-0.03 per conversazione

**Cons:**
- Terze parti (privacy concern)
- Costi variabili

---

### Option 2: Anthropic Claude 3.5 Sonnet
**Pros:**
- Eccellente reasoning per task complessi
- Tool use (function calling)
- Context window grande (200k tokens)
- Ottimo per italiano

**Cons:**
- Costo leggermente più alto
- Meno adozione per function calling

---

### Option 3: Self-hosted (Llama 3.1 70B)
**Pros:**
- Privacy totale
- Zero costi API
- Full control

**Cons:**
- Infra complessa (GPU server)
- Function calling meno affidabile
- Maintenance overhead

**Decisione:** Inizia con GPT-4o, lascia porta aperta a Claude o self-hosted.

---

## Function Calling Schema

### Functions Definition

```typescript
// lib/ai/functions.ts
export const aiFunctions = [
  {
    name: 'create_task',
    description: 'Create one or more tasks with optional project assignment and links',
    parameters: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Task title' },
              description: { type: 'string', description: 'Task description' },
              dueDate: { type: 'string', format: 'date-time', description: 'ISO date string' },
              duration: { type: 'number', description: 'Duration in minutes' },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
              projectName: { type: 'string', description: 'Project name to assign to (will search for it)' },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['title'],
          },
        },
      },
      required: ['tasks'],
    },
  },

  {
    name: 'create_event',
    description: 'Create one or more calendar events',
    parameters: {
      type: 'object',
      properties: {
        events: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              startTime: { type: 'string', format: 'date-time' },
              endTime: { type: 'string', format: 'date-time' },
              location: { type: 'string' },
              allDay: { type: 'boolean' },
              projectName: { type: 'string' },
            },
            required: ['title', 'startTime'],
          },
        },
      },
      required: ['events'],
    },
  },

  {
    name: 'create_note',
    description: 'Create a note or document',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string', description: 'Markdown content' },
        type: { type: 'string', enum: ['note', 'document', 'research', 'idea', 'snippet'] },
        projectName: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['content'],
    },
  },

  {
    name: 'search_entities',
    description: 'Search across tasks, events, notes, projects with complex filters',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        entityTypes: {
          type: 'array',
          items: { type: 'string', enum: ['task', 'event', 'note', 'project'] },
        },
        filters: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            priority: { type: 'string' },
            projectName: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            dateRange: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date-time' },
                end: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      required: ['query'],
    },
  },

  {
    name: 'update_task',
    description: 'Update an existing task',
    parameters: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID (if known) or search query to find it' },
        updates: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] },
            dueDate: { type: 'string', format: 'date-time' },
            priority: { type: 'string' },
          },
        },
      },
      required: ['taskId', 'updates'],
    },
  },

  {
    name: 'delete_entity',
    description: 'Delete a task, event, note, or project',
    parameters: {
      type: 'object',
      properties: {
        entityType: { type: 'string', enum: ['task', 'event', 'note', 'project'] },
        entityId: { type: 'string', description: 'ID or search query' },
        confirmationRequired: {
          type: 'boolean',
          description: 'If true, ask user for confirmation before deleting',
        },
      },
      required: ['entityType', 'entityId'],
    },
  },

  {
    name: 'get_statistics',
    description: 'Get stats about tasks, projects, productivity',
    parameters: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          enum: [
            'tasks_completed_today',
            'tasks_completed_this_week',
            'tasks_completed_this_month',
            'project_progress',
            'upcoming_events',
            'overdue_tasks',
          ],
        },
        projectName: { type: 'string', description: 'Filter by project' },
      },
      required: ['metric'],
    },
  },
];
```

---

## Server Actions

### Parse User Message

```typescript
// features/ai/actions.ts
'use server';

import { auth } from '@/lib/auth';
import OpenAI from 'openai';
import { aiFunctions } from '@/lib/ai/functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseUserMessage(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Build messages array
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a helpful assistant for Plannerinator, a personal life management app.

Current date and time: ${new Date().toISOString()}

Help the user manage their tasks, events, notes, and projects.
When the user asks to create something, extract all relevant information and use the appropriate function.
Always confirm actions before executing if they seem destructive.
Be concise and friendly.

User timezone: Europe/Rome (adjust dates accordingly)`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      functions: aiFunctions,
      function_call: 'auto',
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0].message;

    // Check if function call was made
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

      // Execute the function
      const result = await executeFunctionCall(
        functionName,
        functionArgs,
        session.user.id
      );

      // Generate follow-up response
      const followUpResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          ...messages,
          assistantMessage,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(result),
          },
        ],
        temperature: 0.7,
      });

      return {
        success: true,
        data: {
          message: followUpResponse.choices[0].message.content,
          functionCalled: functionName,
          functionResult: result,
        },
      };
    }

    // No function call, just a regular response
    return {
      success: true,
      data: {
        message: assistantMessage.content,
        functionCalled: null,
      },
    };
  } catch (error) {
    console.error('AI parse error:', error);
    return {
      success: false,
      error: 'Failed to process message',
    };
  }
}
```

---

### Execute Function Call

```typescript
async function executeFunctionCall(
  functionName: string,
  args: any,
  userId: string
) {
  switch (functionName) {
    case 'create_task':
      return await handleCreateTasks(args.tasks, userId);

    case 'create_event':
      return await handleCreateEvents(args.events, userId);

    case 'create_note':
      return await handleCreateNote(args, userId);

    case 'search_entities':
      return await handleSearch(args, userId);

    case 'update_task':
      return await handleUpdateTask(args, userId);

    case 'delete_entity':
      return await handleDeleteEntity(args, userId);

    case 'get_statistics':
      return await handleGetStatistics(args, userId);

    default:
      return { error: `Unknown function: ${functionName}` };
  }
}
```

---

### Handler Examples

```typescript
async function handleCreateTasks(tasks: any[], userId: string) {
  const results = [];

  for (const taskData of tasks) {
    // Resolve project if projectName provided
    let projectId = null;
    if (taskData.projectName) {
      const project = await db.query.projects.findFirst({
        where: and(
          eq(projects.userId, userId),
          ilike(projects.name, `%${taskData.projectName}%`)
        ),
      });
      projectId = project?.id || null;
    }

    // Parse date
    const dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null;

    // Create task
    const result = await createTask({
      title: taskData.title,
      description: taskData.description,
      dueDate,
      duration: taskData.duration,
      priority: taskData.priority || 'medium',
      projectId,
    });

    // Add tags if provided
    if (result.success && taskData.tags) {
      for (const tagName of taskData.tags) {
        await addTagToEntity(tagName, 'task', result.data.id);
      }
    }

    results.push(result);
  }

  return {
    success: results.every(r => r.success),
    tasks: results.map(r => r.data),
    count: results.length,
  };
}

async function handleSearch(args: any, userId: string) {
  const { query, entityTypes, filters } = args;

  const searchResults = await db.query.tasks.findMany({
    where: and(
      eq(tasks.userId, userId),
      // Full-text search
      sql`${tasks.searchVector} @@ plainto_tsquery('italian', ${query})`,
      // Apply filters
      filters?.status ? eq(tasks.status, filters.status) : undefined,
      filters?.priority ? eq(tasks.priority, filters.priority) : undefined
    ),
    limit: 10,
  });

  return {
    success: true,
    results: searchResults,
    count: searchResults.length,
  };
}

async function handleGetStatistics(args: any, userId: string) {
  const { metric, projectName } = args;

  switch (metric) {
    case 'tasks_completed_today': {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await db.select({ count: sql`count(*)` })
        .from(tasks)
        .where(and(
          eq(tasks.userId, userId),
          eq(tasks.status, 'done'),
          gte(tasks.completedAt, today)
        ));

      return {
        success: true,
        metric: 'tasks_completed_today',
        value: count[0].count,
      };
    }

    case 'overdue_tasks': {
      const overdue = await db.query.tasks.findMany({
        where: and(
          eq(tasks.userId, userId),
          ne(tasks.status, 'done'),
          lt(tasks.dueDate, new Date())
        ),
      });

      return {
        success: true,
        metric: 'overdue_tasks',
        value: overdue.length,
        tasks: overdue,
      };
    }

    // ... more metrics
  }
}
```

---

## Chat UI

### Chat Component

```typescript
'use client';

import { useState } from 'react';
import { parseUserMessage } from '@/features/ai/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCalled?: string;
};

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const result = await parseUserMessage(input, history);

      if (result.success) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.data.message,
          timestamp: new Date(),
          functionCalled: result.data.functionCalled,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Error handling
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${result.error}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... (e.g., 'Create a task to call Mario tomorrow')"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        'flex',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <div className="prose prose-sm dark:prose-invert">
          {message.content}
        </div>

        {message.functionCalled && (
          <div className="mt-2 text-xs opacity-70">
            Action: {message.functionCalled}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Conversation Persistence

```typescript
// Store conversation history in database
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_conversations_user (user_id, updated_at DESC)
);

// Load previous conversation
export async function getConversation(userId: string) {
  const conversation = await db.query.aiConversations.findFirst({
    where: eq(aiConversations.userId, userId),
    orderBy: desc(aiConversations.updatedAt),
  });

  return conversation?.messages || [];
}

// Save message to conversation
export async function saveMessageToConversation(
  userId: string,
  message: Message
) {
  const conversation = await getConversation(userId);

  await db.update(aiConversations)
    .set({
      messages: [...conversation, message],
      updatedAt: new Date(),
    })
    .where(eq(aiConversations.userId, userId));
}
```

---

## Example Conversations

### Create Task

```
User: Crea un task per chiamare Mario domani alle 15

AI: Ho creato il task "Chiamare Mario" con scadenza domani alle 15:00. ✓

[Function called: create_task]
[Result: { id: "...", title: "Chiamare Mario", dueDate: "2025-10-22T15:00:00Z" }]
```

---

### Multi-entity Creation

```
User: Devo organizzare un meeting con il cliente venerdì prossimo alle 10,
      crea un evento e un task di preparazione per giovedì

AI: Perfetto! Ho creato:
    1. Evento "Meeting con cliente" - Venerdì 25/10 ore 10:00
    2. Task "Preparazione meeting cliente" - Scadenza Giovedì 24/10

    Vuoi che aggiunga altro? ✓

[Function called: create_task + create_event]
```

---

### Search Query

```
User: Mostrami i task urgenti del progetto Sito Web non ancora completati

AI: Ho trovato 3 task urgenti per il progetto "Sito Web":

    1. ⚠️ Fixare bug header mobile - Scadenza: oggi
    2. ⚠️ Ottimizzare immagini homepage - Scadenza: domani
    3. ⚠️ Test browser compatibility - Scadenza: 25/10

    Vuoi che te ne segni qualcuno come fatto? ✓

[Function called: search_entities]
```

---

### Statistics

```
User: Quanti task ho completato questa settimana?

AI: Questa settimana hai completato 12 task! 🎉

    - Lunedì: 2
    - Martedì: 3
    - Mercoledì: 4
    - Giovedì: 2
    - Venerdì: 1

    Ottimo lavoro! ✓

[Function called: get_statistics]
```

---

## Rate Limiting

```typescript
// Limit AI requests per user
const AI_RATE_LIMIT = {
  requests: 50,
  window: 3600, // 1 hour
};

export async function parseUserMessage(message: string, history: any[]) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Rate limit check
  const { success, remaining } = await rateLimit({
    userId: session.user.id,
    action: 'ai_message',
    limit: AI_RATE_LIMIT.requests,
    window: AI_RATE_LIMIT.window,
  });

  if (!success) {
    return {
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
    };
  }

  // ... rest of function
}
```

---

## Cost Management

```typescript
// Track token usage
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id),
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10, 4),
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_usage_user (user_id, created_at DESC)
);

// After each API call
await db.insert(aiUsage).values({
  userId: session.user.id,
  tokensUsed: response.usage.total_tokens,
  costUsd: calculateCost(response.usage.total_tokens, 'gpt-4o'),
  model: 'gpt-4o',
});

// Get monthly costs
export async function getMonthlyAiCost(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await db.select({
    totalCost: sql`sum(cost_usd)`,
    totalTokens: sql`sum(tokens_used)`,
  })
  .from(aiUsage)
  .where(and(
    eq(aiUsage.userId, userId),
    gte(aiUsage.createdAt, startOfMonth)
  ));

  return result[0];
}
```

---

## Future Enhancements

### 1. Streaming Responses

```typescript
// Stream AI response in real-time
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages,
  functions: aiFunctions,
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    // Send chunk to client via Server-Sent Events
  }
}
```

### 2. Voice Input

```typescript
// Browser Speech Recognition API
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  handleSend(transcript);
};
```

### 3. Smart Suggestions

```typescript
// AI suggests next actions based on context
const suggestions = await getSuggestions({
  currentPage: '/tasks',
  recentActions: [...],
  upcomingEvents: [...],
});

// "You have a meeting in 1 hour, want me to create a reminder?"
// "3 tasks are overdue, should I reschedule them?"
```

### 4. Semantic Search

```typescript
// Vector embeddings for similarity search
import { embed } from '@/lib/ai/embeddings';

const queryEmbedding = await embed(userQuery);

// Find similar notes/tasks using pgvector
const similar = await db.execute(sql`
  SELECT * FROM notes
  WHERE user_id = ${userId}
  ORDER BY embedding <-> ${queryEmbedding}
  LIMIT 5
`);
```

### 5. Proactive Assistant

```typescript
// Daily digest
"Good morning! You have:
- 5 tasks due today
- 2 meetings (10am, 3pm)
- 1 overdue task from yesterday

Should I help you prioritize?"
```
