<svelte:head>
    <link rel="icon" href="/src/front/static/favicon.ico" />
</svelte:head>
<script>
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';
    
</script>

<Header></Header>
<hr>
    <slot></slot>
<hr>
<Footer></Footer>
