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
        id title description status totalTrackedSec activeStartedAt
      }
    }
  `;

  const UPDATE = `
    mutation Update($id: ID!, $status: TaskStatus) {
      updateTask(id: $id, status: $status) {
        id title description status totalTrackedSec activeStartedAt
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

  function format(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function liveSec(startedAtIso?: string | null) {
    if (!startedAtIso) return 0;
    const started = Date.parse(startedAtIso);
    if (Number.isNaN(started)) return 0;
    return Math.max(0, Math.floor((now - started) / 1000));
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

    <button class="btn-primary" on:click={addTask} disabled={loading}>
      {loading ? 'Adding…' : 'Add'}
    </button>
  </div>

  {#if error}
    <p class="error" style="margin:10px 0 0;">{error}</p>
  {/if}
</div>

<div style="height:14px"></div>

<div class="grid" style="gap:12px;">
  {#if tasks.length === 0}
    <div class="card card-pad">
      <strong>No tasks yet.</strong>
      <p class="subtle" style="margin:8px 0 0;">Create one above and start tracking 👆</p>
    </div>
  {/if}

  {#each tasks as task (task.id)}
    <div class="card card-pad">
      <div class="row" style="justify-content:space-between; align-items:flex-start;">
        <div style="min-width:240px; flex:1;">
          <div class="row" style="justify-content:space-between;">
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <strong style="font-size:16px;">{task.title}</strong>
              <span class={badgeClass(task.status)}>{badgeText(task.status)}</span>
            </div>
          </div>

          <div style="margin-top:8px;">
            <small class="subtle" style="display:block; margin:0;">
              Tracked: {format(task.totalTrackedSec)}
            </small>

            {#if task.activeStartedAt}
              <small style="display:block; margin-top:4px;">
                ⏱ Live: {format(liveSec(task.activeStartedAt))}
              </small>
            {/if}
          </div>
        </div>

        <div class="row" style="justify-content:flex-end;">
          <select
            value={task.status}
            on:change={(e) => setStatus(task.id, e.currentTarget.value as TaskStatus)}
            style="min-width:160px;"
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
      </div>
    </div>
  {/each}
</div>
