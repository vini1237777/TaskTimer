<script lang="ts">
  let email = '';
  let password = '';
  let error = '';

  async function submit() {
    error = '';
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error = data.error || 'Login failed';
      return;
    }

    location.href = '/app/tasks';
  }
</script>

<div class="container">
  <h1>Login</h1>

  <div style="display:grid; gap:12px; max-width:700px;">
    <input placeholder="Email" bind:value={email} />
    <input placeholder="Password" type="password" bind:value={password} />
    <button on:click={submit}>Login</button>
  </div>

  {#if error}
    <p style="color:red">{error}</p>
  {/if}

  <p><a href="/auth/signup">Create account</a></p>
</div>