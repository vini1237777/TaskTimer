<script lang="ts">
  import { gql } from '$lib/client/gql';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  const LOGIN = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        user { id email }
      }
    }
  `;

  async function submit() {
    error = '';
    loading = true;

    try {
      await gql<{ login: { user: { id: string; email: string } } }>(LOGIN, {
        email,
        password
      });
      location.href = '/app/tasks';
    } catch (e: any) {
      error = e.message || 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <h1>Login</h1>

  <div style="display:grid; gap:12px; max-width:700px;">
    <input placeholder="Email" bind:value={email} />
    <input placeholder="Password" type="password" bind:value={password} />
    <button on:click={submit} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  </div>

  {#if error}
    <p style="color:red">{error}</p>
  {/if}

  <p><a href="/auth/signup">Create account</a></p>
</div>
