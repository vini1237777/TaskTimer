<script lang="ts">
  import { onMount } from 'svelte';
  import { gql } from '$lib/client/gql';

  type Log = { id: string; taskId: string; startedAt: string; endedAt: string | null; durationSec: number };
  let logs: Log[] = [];
  let error = '';

  const Q = `
    query {
      timeLogs { id taskId startedAt endedAt durationSec }
    }
  `;

  function format(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  onMount(async () => {
    try {
      const data = await gql<{ timeLogs: Log[] }>(Q);
      logs = data.timeLogs;
    } catch (e: any) {
      error = e.message || 'Failed to load logs';
    }
  });
</script>

<h1 style="margin:0 0 12px;">Time Logs</h1>

{#if error}<p style="color:red">{error}</p>{/if}

<div style="display:grid; gap:10px;">
  {#each logs as l (l.id)}
    <div style="border:1px solid #eee; border-radius:10px; padding:12px;">
      <div><strong>Task:</strong> {l.taskId}</div>
      <div><small>Start:</small> {l.startedAt}</div>
      <div><small>End:</small> {l.endedAt ?? 'Running'}</div>
      <div><small>Duration:</small> {format(l.durationSec)}</div>
    </div>
  {/each}
  {#if logs.length === 0}<p>No logs yet.</p>{/if}
</div>
