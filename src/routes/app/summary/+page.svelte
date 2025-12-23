<script lang="ts">
  import { onMount } from 'svelte';
  import { gql } from '$lib/client/gql';

  type Task = { id: string; title: string; description: string; status: string };
  type Summary = {
    totalSec: number;
    completed: number;
    inProgress: number;
    pending: number;
    tasksWorkedOn: Task[];
  };

  let summary: Summary | null = null;
  let error = '';

  const TODAY = `
    query {
      todaySummary {
        totalSec
        completed
        inProgress
        pending
        tasksWorkedOn { id title description status }
      }
    }
  `;

  function format(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  async function load() {
    try {
      const data = await gql<{ todaySummary: Summary }>(TODAY);
      summary = data.todaySummary;
    } catch (e: any) {
      error = e.message || 'Failed to load summary';
    }
  }

  onMount(load);
</script>

<h1 style="margin:0 0 12px;">Today Summary</h1>

{#if error}
  <p style="color:red">{error}</p>
{/if}

{#if summary}
  <div style="display:grid; gap:10px; max-width:700px;">
    <div style="border:1px solid #eee; border-radius:10px; padding:12px;">
      <strong>Total tracked:</strong> {format(summary.totalSec)}
    </div>

    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <div style="border:1px solid #eee; border-radius:10px; padding:12px; flex:1; min-width:160px;">
        <strong>Completed</strong><div>{summary.completed}</div>
      </div>
      <div style="border:1px solid #eee; border-radius:10px; padding:12px; flex:1; min-width:160px;">
        <strong>In Progress</strong><div>{summary.inProgress}</div>
      </div>
      <div style="border:1px solid #eee; border-radius:10px; padding:12px; flex:1; min-width:160px;">
        <strong>Pending</strong><div>{summary.pending}</div>
      </div>
    </div>

    <div style="border:1px solid #eee; border-radius:10px; padding:12px;">
      <strong>Tasks worked on today</strong>
      <ul>
        {#each summary.tasksWorkedOn as t (t.id)}
          <li>{t.title} <small>({t.status})</small></li>
        {/each}
      </ul>
      {#if summary.tasksWorkedOn.length === 0}
        <p>No tracked tasks today.</p>
      {/if}
    </div>
  </div>
{:else if !error}
  <p>Loading…</p>
{/if}
