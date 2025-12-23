<script lang="ts">
  import { gql } from '$lib/client/gql';
  export let data: { user: { email: string } };

  const LOGOUT = `mutation { logout }`;

  function pathActive(path: string) {
    return location?.pathname?.startsWith(path) ? 'active' : '';
  }

  async function logout() {
    await gql<{ logout: boolean }>(LOGOUT);
    location.href = '/auth/login';
  }
</script>

<div class="nav">
  <div class="nav-inner">
    <a class={pathActive('/app/tasks')} href="/app/tasks">Tasks</a>
    <a class={pathActive('/app/summary')} href="/app/summary">Today</a>
    <a class={pathActive('/app/logs')} href="/app/logs">Logs</a>

    <div style="margin-left:auto" class="row">
      <span class="badge">{data.user.email}</span>
      <button class="btn-danger" on:click={logout}>Logout</button>
    </div>
  </div>
</div>

<main class="container">
  <slot />
</main>
