
<script lang="ts">
  import Header from './Header.svelte'
  import About from './About.svelte'
  import Donut from './Curiosities/Donut.svelte'
  import Overflow from './Curiosities/Overflow.svelte'

</script>

<Header/>
<About/>
<Donut/>
<Overflow/>


<style lang="scss">
  @import "public/style/variables";

  :global(body) {
    font-family: $font-family;
    background-color:$primary-blue-color;
    color: $primary-font-color;
  }
</style>
