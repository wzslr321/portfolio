<script>
  import SectionHeader from '../Main/SectionHeader.svelte'
</script>

<section>
    <SectionHeader textContent="Contact Me"/>
    <article>
        <p>
            Reach me via e-mail:
            <span class="highlighted-text">
            wiktor.zajac888@gmail.com
        </span>
        </p>

        <p> Or through the Facebook:
            <a href="https://www.facebook.com/wiktor.zajac.96/" target="_blank">
            <span class="highlighted-text">
                Wiktor Zając
            </span>
            </a>
        </p>
    </article>
</section>

<style lang="scss">
  @import "public/style/variables.scss";

  section {
    width: $container-width;
    margin: 0 auto;
    padding: $horizontal-padding 0;
    text-align: center;

    article {
      padding: $horizontal-padding 0;
      font-size: 1.3em;

      p {
        a {
          text-decoration: none;
        }
      }
    }
  }
</style>




