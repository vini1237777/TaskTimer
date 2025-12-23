<script lang="ts">
  import { onMount } from 'svelte';

  type Task = { _id?: string; id?: string; title: string; status: string };

  let title = '';
  let tasks: Task[] = [];
  let loading = false;
  let error = '';

  async function loadTasks() {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    tasks = data.tasks || [];
  }

  async function addTask() {
    const t = title.trim();
    if (!t) return;

    loading = true;
    error = '';

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: t })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error = data.error || 'Failed to add task';
      loading = false;
      return;
    }

    title = '';
    await loadTasks();
    loading = false;
  }

  onMount(loadTasks);
</script>

<div class="container">
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
    {#each tasks as task}
      <div style="border:1px solid #eee; border-radius:10px; padding:12px;">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
          <strong>{task.title}</strong>
          <small>{task.status}</small>
        </div>
      </div>
    {/each}

    {#if tasks.length === 0}
      <p>No tasks yet 👀</p>
    {/if}
  </div>
</div>
