<section>
    <a href="https://en.wikipedia.org/wiki/Integer_overflow" target="_blank">
        <p> Or did you know that computer can return number
            <span class="highlighted"> 127 </span>
            as result of calculation
            <span class="highlighted"> -128 - 1 </span> ?
        </p>
    </a>
</section>

<style lang="scss">
  @import "public/style/variables.scss";

  section {
    max-width: 70%;
    margin: 7.5em auto;
    text-align: center;
    font-size: 1.3em;
    text-transform: uppercase;
    letter-spacing: 0.75px;
    word-spacing: 1px;

    .highlighted {
      font-weight: bold;
      color: $primary-orange-color;
    }

    a {
      color: $primary-font-color;
      text-decoration: none;

      p {
        border-bottom: 5px solid $dark-grey-color;
        padding-bottom:0.5em;
      }
    }

    a:hover {
      transition: 1s;
      font-size: 1.05em;
    }
  }
</style>
