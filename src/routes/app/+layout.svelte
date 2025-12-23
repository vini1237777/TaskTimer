<script lang="ts">
  import { gql } from '$lib/client/gql';
  export let data: { user: { email: string } };

  const LOGOUT = `mutation { logout }`;

  async function logout() {
    await gql<{ logout: boolean }>(LOGOUT);
    location.href = '/auth/login';
  }
</script>

<nav style="display:flex; gap:12px; padding:12px; border-bottom:1px solid #ddd;">
  <a href="/app/tasks">Tasks</a>
  <a href="/app/summary">Today Summary</a>
  <a href="/app/logs">Logs</a>


  <div style="margin-left:auto; display:flex; gap:12px; align-items:center;">
    <span>{data.user.email}</span>
    <button on:click={logout}>Logout</button>
  </div>
</nav>

<main class="container">
  <slot />
</main>
