<script lang="ts">
  import Header from './Main/MainHeader.svelte'
  import About from './Main/About.svelte'
  import Donut from './Curiosities/Donut.svelte'
  import Overflow from './Curiosities/Overflow.svelte'
  import Github from './Experience/Github.svelte'
  import Contact from './Contact/Contact.svelte'
  import Footer from './Footer/Footer.svelte'

</script>

<Header/>
<About/>
<Donut/>
<Overflow/>
<Github/>
<Contact/>
<Footer/>


<style lang="scss">
  @import "public/style/variables";

  :global(body) {
    font-family: $font-family;
    background-color: $primary-blue-color;
    color: $primary-font-color;
    padding:0;
    margin:0;
  }
  :global(.highlighted-text) {
    font-weight: bold;
    color: $primary-orange-color;
  }
</style>
