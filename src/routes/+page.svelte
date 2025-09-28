<script>
  import { onMount } from 'svelte';

  let username = '';
  let password = '';
  let termsAccepted = false;
  let zoneId = '';
  let loginState = 'loading';
  let errorMessage = '';
  let showError = false;

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  onMount(() => {
    zoneId = typeof window !== 'undefined' && window.zoneid ? window.zoneid : '';
    checkStatus();
  });

  $: canSubmit = termsAccepted && username.trim().length > 0 && password.trim().length > 0;
  $: isPasswordLoginVisible = loginState === 'password';
  $: isAnonymousLoginVisible = loginState === 'anonymous';
  $: isLogoutVisible = loginState === 'authorized';

  function buildPayload(user, pwd) {
    const payload = new URLSearchParams();
    payload.set('user', user);
    payload.set('password', pwd);
    return payload;
  }

  function getRedirectUrl() {
    if (!params) return null;
    return params.get('redirurl');
  }

  function handleSuccessRedirect(useHttps = true) {
    const redir = getRedirectUrl();
    if (redir) {
      const protocol = useHttps ? 'https://' : 'http://';
      window.location.href = `${protocol}${redir}?refresh`;
    } else {
      window.location.reload();
    }
  }

  async function apiRequest(path, body) {
    if (!zoneId) {
      throw new Error('Die Zonenkonfiguration ist nicht verfügbar.');
    }

    const response = await fetch(`/api/captiveportal/access/${path}/${zoneId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body
    });

    if (!response.ok) {
      throw new Error('unable to connect to authentication server');
    }

    return await response.json();
  }

  function showErrorMessage(message) {
    errorMessage = message;
    showError = true;
  }

  async function checkStatus() {
    try {
      const data = await apiRequest('status', buildPayload(username, password));

      if (data.clientState === 'AUTHORIZED') {
        loginState = 'authorized';
      } else if (data.authType === 'none') {
        loginState = 'anonymous';
      } else {
        loginState = 'password';
      }
    } catch (error) {
      showErrorMessage(error.message || 'unable to connect to authentication server');
      loginState = 'password';
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    showError = false;

    try {
      const data = await apiRequest('logon', buildPayload(username, password));
      if (data.clientState === 'AUTHORIZED') {
        handleSuccessRedirect(true);
      } else {
        username = '';
        password = '';
        showErrorMessage('authentication failed');
      }
    } catch (error) {
      showErrorMessage(error.message || 'unable to connect to authentication server');
    }
  }

  async function handleAnonymousLogin(event) {
    event.preventDefault();
    showError = false;

    try {
      const data = await apiRequest('logon', buildPayload('', ''));
      if (data.clientState === 'AUTHORIZED') {
        handleSuccessRedirect(false);
      } else {
        showErrorMessage('login failed');
      }
    } catch (error) {
      showErrorMessage(error.message || 'unable to connect to authentication server');
    }
  }

  async function handleLogout(event) {
    event.preventDefault();
    showError = false;

    try {
      await apiRequest('logoff', buildPayload('', ''));
      window.location.reload();
    } catch (error) {
      showErrorMessage(error.message || 'unable to connect to authentication server');
    }
  }

  function closeError() {
    showError = false;
  }
</script>

<svelte:head>
  <title>WiFi-Login</title>
</svelte:head>

<div class="blur-background relative min-h-screen bg-gray-100">
  <div class="container mx-auto max-w-lg p-5 min-h-screen flex items-center justify-center">
    <div class="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full">
      <div class="flex justify-between items-center mb-6">
        <img class="w-24" src="/images/ats-logo.png" alt="ATS Logo" />
        <img class="w-32 justify-end" src="/images/opnsense.png" alt="OPNsense Logo" />
      </div>
      <header class="mb-10">
        <div class="text-justify">
          <h1 class="text-2xl font-medium mb-2">Willkommen im ATS-Netzwerk</h1>
          <p class="mt-2 text-sm">
            Indem Sie das Netzwerk nutzen, erklären Sie sich damit einverstanden, die folgenden
            Nutzungsbedingungen einzuhalten. Wenn Sie nicht einverstanden sind, dürfen Sie das Netzwerk nicht
            nutzen.
          </p>
        </div>
      </header>

      <main>
        {#if isPasswordLoginVisible}
          <form class="form-signin" on:submit|preventDefault={handleLogin}>
            <div class="mb-6">
              <h3 class="font-medium text-xl mb-2">Anmeldung im ATS-Netzwerk</h3>
              <p class="text-sm text-gray-600">
                Geben Sie Ihren Benutzernamen und Ihr Passwort ein, um sich anzumelden:
              </p>
            </div>
            <div class="mb-4">
              <label for="inputUsername" class="block text-gray-700 text-sm font-medium mb-2">Benutzername</label>
              <input
                id="inputUsername"
                class="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-600 mb-3 focus:outline-none focus:shadow-outline"
                bind:value={username}
                required
                autocomplete="username"
              />
            </div>
            <div class="mb-3">
              <label for="inputPassword" class="block text-gray-700 text-sm font-medium mb-2">Passwort</label>
              <input
                type="password"
                id="inputPassword"
                class="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-600 mb-3 focus:outline-none focus:shadow-outline"
                bind:value={password}
                required
                autocomplete="current-password"
              />
            </div>
            <div class="mb-6 flex items-start">
              <input
                type="checkbox"
                id="termsCheckbox"
                class="mt-1"
                bind:checked={termsAccepted}
                required
              />
              <label for="termsCheckbox" class="text-sm ml-2">
                Ich stimme den
                <a class="text-blue-600 font-semibold hover:text-blue-950 after:content-['_↗']" href="/terms" target="_blank"
                  >Nutzungsbedingungen</a
                >
                zu.
              </label>
            </div>

            <button
              class="btn btn-primary w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={!canSubmit}
            >
              Anmelden
            </button>
          </form>
        {/if}

        {#if isAnonymousLoginVisible}
          <div class="mt-6">
            <button
              class="btn btn-primary w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline"
              on:click|preventDefault={handleAnonymousLogin}
            >
              Anonym anmelden
            </button>
          </div>
        {/if}

        {#if isLogoutVisible}
          <div class="mt-6">
            <button
              class="btn btn-primary w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline"
              on:click|preventDefault={handleLogout}
            >
              Abmelden
            </button>
          </div>
        {/if}

        {#if showError}
          <div class="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6" role="alert">
            <span class="block sm:inline">{errorMessage}</span>
            <button
              class="absolute top-0 bottom-0 right-0 px-4 py-3"
              type="button"
              aria-label="Fehler schließen"
              on:click={closeError}
            >
              <svg class="fill-current h-6 w-6 text-red-500" role="img" viewBox="0 0 20 20">
                <title>Schließen</title>
                <path
                  d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
                />
              </svg>
            </button>
          </div>
        {/if}
      </main>
    </div>
  </div>
</div>
