<script lang="ts">
  import { onMount } from 'svelte';
  import { gql } from '$lib/client/gql';

  type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

  type Task = {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    totalTrackedSec: number;
    activeStartedAt?: string | null;
  };

  let title = '';
  let tasks: Task[] = [];
  let error = '';
  let loading = false;

  // AI suggestion state
  let suggested: { title: string; description: string } | null = null;
  let suggesting = false;

  // edit state
  let editingId: string | null = null;
  let editTitle = '';
  let editDescription = '';

  // live tick for active timer display
  let now = Date.now();
  let tick: any;

  const TASKS = `
    query {
      tasks {
        id
        title
        description
        status
        totalTrackedSec
        activeStartedAt
      }
    }
  `;

  const CREATE = `
    mutation Create($input: String!) {
      createTask(input: $input) {
        id
        title
        description
        status
        totalTrackedSec
        activeStartedAt
      }
    }
  `;

  const UPDATE = `
    mutation Update($id: ID!, $status: TaskStatus, $title: String, $description: String) {
      updateTask(id: $id, status: $status, title: $title, description: $description) {
        id
        title
        description
        status
        totalTrackedSec
        activeStartedAt
      }
    }
  `;

  const REMOVE = `
    mutation Remove($id: ID!) { deleteTask(id: $id) }
  `;

  const START = `
    mutation Start($taskId: ID!) {
      startTimer(taskId: $taskId) { id taskId startedAt endedAt durationSec }
    }
  `;

  const STOP = `
    mutation Stop($taskId: ID!) {
      stopTimer(taskId: $taskId) { id taskId startedAt endedAt durationSec }
    }
  `;

  const SUGGEST = `
    mutation Suggest($input: String!) {
      suggestTask(input: $input) { title description }
    }
  `;

  function format(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function trackedSec(task: Task) {
  const base = task.totalTrackedSec ?? 0;
  const running = task.activeStartedAt ? liveSec(task.activeStartedAt, now) : 0;
  return base + running;
}

  function liveSec(startedAtIso: string | null | undefined, nowMs: number) {
    if (!startedAtIso) return 0;
    const started = Date.parse(startedAtIso);
    if (Number.isNaN(started)) return 0;
    return Math.max(0, Math.floor((nowMs - started) / 1000));
  }

  function badgeClass(status: TaskStatus) {
    if (status === 'COMPLETED') return 'badge ok';
    if (status === 'IN_PROGRESS') return 'badge warn';
    return 'badge';
  }

  function badgeText(status: TaskStatus) {
    if (status === 'COMPLETED') return 'Completed';
    if (status === 'IN_PROGRESS') return 'In Progress';
    return 'Pending';
  }

  async function loadTasks() {
    const data = await gql<{ tasks: Task[] }>(TASKS);
    tasks = data.tasks;
  }

  async function addTask() {
    const t = title.trim();
    if (!t) return;

    loading = true;
    error = '';

    try {
      await gql(CREATE, { input: t });
      title = '';
      suggested = null;
      await loadTasks();
    } catch (e: any) {
      error = e?.message || 'Failed to add task';
    } finally {
      loading = false;
    }
  }

  async function setStatus(id: string, status: TaskStatus) {
    error = '';
    try {
      await gql(UPDATE, { id, status });
      await loadTasks();
    } catch (e: any) {
      error = e?.message || 'Failed to update status';
    }
  }

  async function deleteTask(id: string) {
    error = '';
    try {
      await gql(REMOVE, { id });
      await loadTasks();
    } catch (e: any) {
      error = e?.message || 'Failed to delete task';
    }
  }

  async function startTimer(taskId: string) {
    error = '';
    try {
      await gql(START, { taskId });
      await loadTasks();
    } catch (e: any) {
      error = e?.message || 'Failed to start timer';
    }
  }

  async function stopTimer(taskId: string) {
    error = '';
    try {
      await gql(STOP, { taskId });
      await loadTasks();
    } catch (e: any) {
      error = e?.message || 'Failed to stop timer';
    }
  }

  async function suggest() {
    const t = title.trim();
    if (!t) return;

    error = '';
    suggesting = true;
    try {
      const data = await gql<{ suggestTask: { title: string; description: string } }>(SUGGEST, { input: t });
      suggested = data.suggestTask;
    } catch (e: any) {
      error = e?.message || 'Failed to suggest';
    } finally {
      suggesting = false;
    }
  }

  function applySuggestion() {
    if (!suggested) return;
    title = suggested.title;
    suggested = null;
  }

  function startEdit(t: Task) {
    editingId = t.id;
    editTitle = t.title;
    editDescription = t.description ?? '';
  }

  function cancelEdit() {
    editingId = null;
    editTitle = '';
    editDescription = '';
  }

  async function saveEdit(id: string) {
    error = '';
    const t = editTitle.trim();
    const d = editDescription.trim();
    if (!t) {
      error = 'Title cannot be empty.';
      return;
    }

    try {
      await gql(UPDATE, { id, title: t, description: d });
      cancelEdit();
      await loadTasks();
    } catch (e: any) {
      error = e?.message || 'Failed to update task';
    }
  }

  onMount(async () => {
    await loadTasks();
    tick = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(tick);
  });
</script>

<h1 class="h1">Tasks</h1>
<p class="subtle">
  Add a task, hit <span class="kbd">Start</span>, and let the timer do the rest.
</p>

<div class="card card-pad" style="max-width:720px;">
  <div class="row">
    <div style="flex:1; min-width:240px;">
      <input
        placeholder="e.g. follow up with designer"
        bind:value={title}
        on:keydown={(e) => e.key === 'Enter' && addTask()}
      />
    </div>

    <button on:click={suggest} disabled={suggesting || !title.trim()}>
      {suggesting ? 'Suggesting…' : 'Suggest'}
    </button>

    <button class="btn-primary" on:click={addTask} disabled={loading || !title.trim()}>
      {loading ? 'Adding…' : 'Add'}
    </button>
  </div>

  {#if error}
    <p class="error" style="margin:10px 0 0;">{error}</p>
  {/if}
</div>

{#if suggested}
  <div class="card card-pad" style="max-width:720px; margin-top:12px;">
    <div class="row" style="justify-content:space-between;">
      <strong>Suggestion</strong>
      <div class="row">
        <button class="btn-primary" on:click={applySuggestion}>Use title</button>
        <button on:click={() => (suggested = null)}>Dismiss</button>
      </div>
    </div>

    <p class="subtle" style="margin:10px 0 0;">
      <strong>Title:</strong> {suggested.title}
    </p>
    <p class="subtle" style="margin:8px 0 0;">
      <strong>Description:</strong> {suggested.description}
    </p>
  </div>
{/if}

<div style="height:14px"></div>

<div class="grid" style="gap:12px;">
  {#if tasks.length === 0}
    <div class="card card-pad">
      <strong>No tasks yet.</strong>
      <p class="subtle" style="margin:8px 0 0;">Create one above and start tracking</p>
    </div>
  {/if}

  {#each tasks as task (task.id)}
    <div class="card card-pad">
      <div class="row" style="justify-content:space-between; align-items:flex-start;">
        <div style="min-width:240px; flex:1;">
          {#if editingId === task.id}
            <div class="grid" style="gap:10px; width:100%;">
              <input bind:value={editTitle} placeholder="Task title" />
              <input bind:value={editDescription} placeholder="Short description (optional)" />
              <div class="row">
                <button class="btn-primary" on:click={() => saveEdit(task.id)}>Save</button>
                <button on:click={cancelEdit}>Cancel</button>
              </div>
            </div>
          {:else}
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <strong style="font-size:16px;">{task.title}</strong>
              <span class={badgeClass(task.status)}>{badgeText(task.status)}</span>
              <button on:click={() => startEdit(task)}>Edit</button>
            </div>

            {#if task.description}
              <p class="subtle" style="margin:10px 0 0;">{task.description}</p>
            {/if}

            <div style="margin-top:10px;">
              {#if task.activeStartedAt}
                <small style="display:block; margin-top:4px;">
                  ⏱ Live: {format(liveSec(task.activeStartedAt, now))}
                </small>
              {/if}
            </div>
          {/if}
        </div>

        {#if editingId !== task.id}
          <div class="row" style="justify-content:flex-end;">
            <select
              value={task.status}
              on:change={(e) => setStatus(task.id, e.currentTarget.value as TaskStatus)}
              style="min-width:180px;"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {#if task.activeStartedAt}
              <button on:click={() => stopTimer(task.id)}>Stop</button>
            {:else}
              <button class="btn-primary" on:click={() => startTimer(task.id)}>Start</button>
            {/if}

            <button class="btn-danger" on:click={() => deleteTask(task.id)}>Delete</button>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
