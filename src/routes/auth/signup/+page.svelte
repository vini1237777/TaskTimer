<script lang="ts">
  import { gql } from '$lib/client/gql';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  const SIGNUP = `
    mutation Signup($email: String!, $password: String!) {
      signup(email: $email, password: $password) {
        user { id email }
      }
    }
  `;

  async function submit() {
    error = '';
    loading = true;

    try {
      await gql<{ signup: { user: { id: string; email: string } } }>(SIGNUP, {
        email,
        password
      });
      location.href = '/app/tasks';
    } catch (e: any) {
      error = e.message || 'Signup failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <div class="card card-pad" style="max-width:560px; margin: 30px auto;">
    <h1 class="h1">Create your account</h1>
    <p class="subtle">Takes 20 seconds. Start with one task and hit Start.</p>

    <div class="grid">
      <input placeholder="you@company.com" bind:value={email} />
      <input placeholder="Password (min 6 chars)" type="password" bind:value={password} />
      <button class="btn-primary" on:click={submit} disabled={loading}>
        {loading ? 'Creating…' : 'Create account'}
      </button>
      {#if error}<p class="error">{error}</p>{/if}
    </div>

    <p class="subtle" style="margin-top:14px">
      Already have an account? <a href="/auth/login">Login</a>
    </p>
  </div>
</div>
