<script>
  import SectionHeader from '../Main/SectionHeader.svelte'
</script>

<section id="contact-section">
    <SectionHeader textContent="Contact Me"/>
    <article id="contact">
        <p>
            Reach me via:
        </p>
        <p>
            Email:
            <span class="highlighted-text">
                wiktor.zajac888@gmail.com
            </span>
            Twitter:
            <a href="https://twitter.com/WiktorZajc10" target="_blank">
            <span class="highlighted-text">
                Wiktor Zając
            </span>
            </a>
            Or
            <a href="https://www.linkedin.com/in/wiktor-zaj%C4%85c-027622207/" target="_blank">
                <span class="highlighted-text">
                    LinkedIn
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

        span {
          text-shadow: 1px 1px 1px black;
        }
      }
    }
  }

</style>




