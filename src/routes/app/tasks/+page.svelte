<script lang="ts">
  import { onMount } from 'svelte';
  import { gql } from '$lib/client/gql';

  type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  type Task = { id: string; title: string; description: string; status: TaskStatus };

  let title = '';
  let tasks: Task[] = [];
  let error = '';
  let loading = false;

  // live timer state
  let activeTaskId: string | null = null;
  let activeStartedAt: number | null = null;
  let now = Date.now();
  let tick: any;

  const TASKS = `
    query {
      tasks { id title description status }
    }
  `;

  const CREATE = `
    mutation Create($input: String!) {
      createTask(input: $input) { id title description status }
    }
  `;

  const UPDATE = `
    mutation Update($id: ID!, $status: TaskStatus) {
      updateTask(id: $id, status: $status) { id title description status }
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

  function activeElapsedSec() {
    if (!activeStartedAt) return 0;
    return Math.max(0, Math.floor((now - activeStartedAt) / 1000));
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
      error = e.message || 'Failed to add task';
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
      error = e.message || 'Failed to update';
    }
  }

  async function deleteTask(id: string) {
    error = '';
    try {
      await gql(REMOVE, { id });
      await loadTasks();
    } catch (e: any) {
      error = e.message || 'Failed to delete';
    }
  }

  async function startTimer(taskId: string) {
    error = '';
    try {
      const data = await gql<{ startTimer: { startedAt: string; taskId: string } }>(START, { taskId });
      activeTaskId = taskId;
      activeStartedAt = Date.parse(data.startTimer.startedAt);
      clearInterval(tick);
      tick = setInterval(() => (now = Date.now()), 1000);
      await loadTasks();
    } catch (e: any) {
      error = e.message || 'Failed to start timer';
    }
  }

  async function stopTimer(taskId: string) {
    error = '';
    try {
      await gql(STOP, { taskId });
      activeTaskId = null;
      activeStartedAt = null;
      clearInterval(tick);
      await loadTasks();
    } catch (e: any) {
      error = e.message || 'Failed to stop timer';
    }
  }

  onMount(async () => {
    await loadTasks();
    tick = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(tick);
  });
</script>

<h1 style="margin: 0 0 12px;">Tasks</h1>

<div style="display:grid; gap:10px; max-width:700px; margin-bottom:16px;">
  <input
    placeholder="e.g. follow up with designer"
    bind:value={title}
    on:keydown={(e) => e.key === 'Enter' && addTask()}
  />
  <button on:click={addTask} disabled={loading}>
    {loading ? 'Adding...' : 'Add Task'}
  </button>

  {#if error}
    <p style="color:red; margin:0;">{error}</p>
  {/if}
</div>

<div style="display:grid; gap:10px;">
  {#each tasks as task (task.id)}
    <div style="border:1px solid #eee; border-radius:10px; padding:12px;">
      <div style="display:flex; gap:12px; justify-content:space-between; align-items:center; flex-wrap:wrap;">
        <div style="min-width:240px;">
          <div><strong>{task.title}</strong></div>
          <small>{task.status}</small>
          {#if activeTaskId === task.id}
            <div style="margin-top:6px;">
              <small>⏱ Live: {format(activeElapsedSec())}</small>
            </div>
          {/if}
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <select
            value={task.status}
            on:change={(e) => setStatus(task.id, (e.currentTarget.value as any))}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {#if activeTaskId === task.id}
            <button on:click={() => stopTimer(task.id)}>Stop</button>
          {:else}
            <button on:click={() => startTimer(task.id)}>Start</button>
          {/if}

          <button on:click={() => deleteTask(task.id)}>Delete</button>
        </div>
      </div>
    </div>
  {/each}

  {#if tasks.length === 0}
    <p>No tasks yet</p>
  {/if}
</div>
