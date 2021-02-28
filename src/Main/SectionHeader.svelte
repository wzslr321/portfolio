<script lang="ts">
  export let textContent: string
</script>

<header>
    <h2> {textContent}</h2>
</header>

<style lang="scss">
  @import "public/style/variables";

  header {
    text-transform: uppercase;
    letter-spacing: 2px;
    text-align: center;
    font-weight: 100;

    h2 {
      color: $primary-orange-color;
      text-shadow: 2px 2px 2px black;
    }

  }


</style>
