<script lang="ts">
  export let data: { user: { email: string } };

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.href = '/auth/login';
  }
</script>

<nav style="display:flex; gap:12px; padding:12px; border-bottom:1px solid #ddd;">
  <a href="/app/tasks">Tasks</a>
  <a href="/app/summary">Today Summary</a>

  <div style="margin-left:auto; display:flex; gap:12px; align-items:center;">
    <span>{data.user.email}</span>
    <button on:click={logout}>Logout</button>
  </div>
</nav>

<main style="padding:16px;">
  <slot />
</main>
