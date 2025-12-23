<script lang="ts">
  let email = '';
  let password = '';
  let error = '';

  async function submit() {
    error = '';
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error = data.error || 'Signup failed';
      return;
    }

    location.href = '/app/tasks';
  }
</script>

<div class="container">

<h1>Sign up</h1>

 <div style="display:grid; gap:12px; max-width:700px;">
<input placeholder="Email" bind:value={email} />
<input placeholder="Password (min 6 chars)" type="password" bind:value={password} />
<button on:click={submit}>Create account</button>
</div>


{#if error}
  <p style="color:red">{error}</p>
{/if}

<p><a href="/auth/login">Already have an account?</a></p>

</div>
