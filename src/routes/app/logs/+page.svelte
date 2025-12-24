<script lang="ts">
  import { onMount } from 'svelte';
  import { gql } from '$lib/client/gql';

  type Log = {
    id: string;
    taskId: string;
    taskTitle: string;
    startedAt: string;
    endedAt: string | null;
    durationSec: number;
  };

  let logs: Log[] = [];
  let error = '';
  let loading = false;

  const Q = `
    query {
      timeLogs {
        id
        taskId
        taskTitle
        startedAt
        endedAt
        durationSec
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

  function dt(iso: string) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  onMount(async () => {
    loading = true;
    error = '';
    try {
      const data = await gql<{ timeLogs: Log[] }>(Q);
      logs = data.timeLogs;
    } catch (e: any) {
      error = e?.message || 'Failed to load logs';
    } finally {
      loading = false;
    }
  });
</script>

<h1 class="h1">Time Logs</h1>
<p class="subtle">Sessions Tracked.</p>

{#if loading}
  <p class="subtle">Loading…</p>
{/if}

{#if error}
  <p class="error">{error}</p>
{/if}

<div class="grid" style="gap:12px;">
  {#if !loading && logs.length === 0}
    <div class="card card-pad">
      <strong>No logs yet.</strong>
      <p class="subtle" style="margin:8px 0 0;">Start a timer from Tasks to generate logs.</p>
    </div>
  {/if}

  {#each logs as l (l.id)}
    <div class="card card-pad">
      <div class="row" style="justify-content:space-between; align-items:flex-start;">
        <div style="min-width:240px; flex:1;">
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <strong style="font-size:16px;">{l.taskTitle}</strong>
            {#if !l.endedAt}
              <span class="badge warn">Running</span>
            {:else}
              <span class="badge">Stopped</span>
            {/if}
          </div>

          <div style="margin-top:10px;">
            <div><small class="subtle">Start:</small> {dt(l.startedAt)}</div>
            <div><small class="subtle">End:</small> {l.endedAt ? dt(l.endedAt) : 'Running'}</div>
          </div>
        </div>

        <div style="text-align:right; min-width:140px;">
          <div class="badge ok">Duration {format(l.durationSec)}</div>
        </div>
      </div>
    </div>
  {/each}
</div>
