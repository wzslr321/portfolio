<script lang="ts">
  import { onMount } from 'svelte'

  onMount(() => {
    const preTag = document.querySelector<HTMLPreElement>('pre')
    let A = 1, B = 1

    const asciiFrame = () => {
      let b = []
      let z = []
      A += 0.07
      B += 0.03
      let cA = Math.cos(A),
        sA = Math.sin(A),
        cB = Math.cos(B),
        sB = Math.sin(B)
      for (let k = 0; k < 1760; k++) {
        b[k] = k % 80 == 79 ? '\n' : ' '
        z[k] = 0
      }
      for (let j = 0; j < 6.28; j += 0.07) {
        let ct = Math.cos(j),
          st = Math.sin(j)
        for (let i = 0; i < 6.28; i += 0.02) {
          let sp = Math.sin(i),
            cp = Math.cos(i),
            h = ct + 2,
            D = 1 / (sp * h * sA + st * cA + 5),
            t = sp * h * cA - st * sA
          let x = 0 | (40 + 30 * D * (cp * h * cB - t * sB)),
            y = 0 | (12 + 15 * D * (cp * h * sB + t * cB)),
            o = x + 80 * y,
            N =
              0 |
              (8 *
                ((st * sA - sp * ct * cA) * cB -
                  sp * ct * sA -
                  st * cA -
                  cp * ct * sB))
          if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
            z[o] = D
            b[o] = '.,-~:;=!*#$@'[N > 0 ? N : 0]
          }
        }
      }
      preTag.innerHTML = b.join('')
    }

    setInterval(asciiFrame, 50)

  })
</script>

<section>
    <header>
        <h3>I try to look on programming from a more interesting side.</h3>
        <p>For example, look at this cool donut code which generates spinning donut!</p>
    </header>
    <section>
        <article>
            <img src="images/donut.png" alt="donut"/>
        </article>
        <article class="container">
            <pre class="center" id="d"></pre>
        </article>
    </section>
</section>

<style lang="scss">
  section {
    max-width: 70%;
    justify-content: center;
    margin: 0 auto;
    text-align: center;

    header {
      justify-content: center;

      h3 {
        color: #F2AA4CFF;
        text-transform: uppercase;
        font-size: 1.35em;
      }

      p {
        font-size: 1.1em;
      }
    }

    article {
      margin-top: 3.5em;
    }

    section {
      display: flex;
      align-items:center;
      justify-content: center;
    }
  }

</style>
