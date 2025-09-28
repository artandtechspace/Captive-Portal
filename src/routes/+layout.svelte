<script>
    import "../app.css";
</script>

<svelte:head>
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible"/>
    <meta content="index, follow, noodp, noydir" name="robots"/>
    <meta content="" name="keywords"/>
    <meta content="" name="description"/>
    <meta content="" name="copyright"/>
    <link href="/favicon/favicon.ico" rel="icon"/>
    <script src="/js/zone.js"></script>
</svelte:head>

<slot/>

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
