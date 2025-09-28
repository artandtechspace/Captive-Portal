<svelte:head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="robots" content="index, follow, noodp, noydir" />
  <meta name="keywords" content="" />
  <meta name="description" content="" />
  <meta name="copyright" content="" />
  <link rel="icon" href="/favicon/favicon.ico" />
  <link rel="stylesheet" href="/css/output.css" />
  <script src="/js/zone.js"></script>
</svelte:head>

<slot />

<style>
  :global(body) {
    background-image: url('/images/landscape_poli.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    min-height: 100vh;
  }

  :global(.blur-background::before) {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    filter: blur(4px);
    z-index: -1;
  }
</style>
