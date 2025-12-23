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
  <div class="card card-pad" style="max-width:560px; margin: 30px auto;">
    <h1 class="h1">Welcome back</h1>
    <p class="subtle">Login to continue tracking tasks and focus time.</p>

    <div class="grid">
      <input placeholder="you@company.com" bind:value={email} />
      <input placeholder="Password" type="password" bind:value={password} />
      <button class="btn-primary" on:click={submit} disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>
      {#if error}<p class="error">{error}</p>{/if}
    </div>

    <p class="subtle" style="margin-top:14px">
      New here? <a href="/auth/signup">Create an account</a>
    </p>
  </div>
</div>
