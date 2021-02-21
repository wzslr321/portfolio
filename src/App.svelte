<script lang="ts">
    import Header from './Header.svelte';
</script>

<main>
    <Header/>
</main>

<style lang="scss">
  	:global(body){
		background-color:#101820FF;
	}
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		@media (min-width: 640px) {
			max-width: none;
		}
	}
</style>
