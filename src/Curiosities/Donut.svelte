<script lang="ts">
  const headerText: String = 'I try to look on programming from a more interesting side'

  // Most of the script is from: https://github.com/petercunha/Donut
  import { onMount } from 'svelte'
  import SectionHeader from '../Main/SectionHeader.svelte'

  onMount(() => {
    const preTag = document.querySelector<HTMLPreElement>('pre')
    let A: number = 1, B: number = 1

    const asciiFrame = () => {
      let b: Array<string> = []
      let z: Array<number> = []
      A += 0.07
      B += 0.03
      let cA: number = Math.cos(A),
        sA: number = Math.sin(A),
        cB: number = Math.cos(B),
        sB: number = Math.sin(B)
      for (let k = 0; k < 1760; k++) {
        b[k] = k % 80 == 79 ? '\n' : ' '
        z[k] = 0
      }
      for (let j = 0; j < 6.28; j += 0.07) {
        let ct: number = Math.cos(j),
          st: number = Math.sin(j)
        for (let i = 0; i < 6.28; i += 0.02) {
          let sp: number = Math.sin(i),
            cp: number = Math.cos(i),
            h: number = ct + 2,
            D: number = 1 / (sp * h * sA + st * cA + 5),
            t: number = sp * h * cA - st * sA
          let x: number = 0 | (40 + 30 * D * (cp * h * cB - t * sB)),
            y: number = 0 | (12 + 15 * D * (cp * h * sB + t * cB)),
            o: number = x + 80 * y,
            N: number =
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
    <SectionHeader textContent={headerText}/>
    <p>
        For example, look at this cool donut shaped code which generates spinning donut!
    </p>
    <section>
        <article>
            <picture>
                <img src="images/donut.webp" alt="donut" width="100%" height="100%"/>
            </picture>
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

    p {
      font-size: 1.3em;
    }

    article {
      margin-top: 3.5em;
    }

    section {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  @media(max-width:992px) {
    section {
      max-width:90%;
      section {
        article {
          max-width:50%;
          pre {
            font-size:3.5px;
            max-width:100%;
            white-space: pre-wrap;
            word-wrap:break-word;
          }
        }
      }
    }
  }
</style>
