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
  <h1>Sign up</h1>

  <div style="display:grid; gap:12px; max-width:700px;">
    <input placeholder="Email" bind:value={email} />
    <input placeholder="Password (min 6 chars)" type="password" bind:value={password} />
    <button on:click={submit} disabled={loading}>
      {loading ? 'Creating...' : 'Create account'}
    </button>
  </div>

  {#if error}
    <p style="color:red">{error}</p>
  {/if}

  <p><a href="/auth/login">Already have an account?</a></p>
</div>
