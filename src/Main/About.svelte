<main>
    <section>
        <section>
            <picture>
                <img src="images/myself.webp" alt="myself" width="100%" height="100%"/>
            </picture>
        </section>
        <p>
            I am a High School student, in the past I have mostly focused
            on getting knowledge and experience in Web Development, using
            <span class="highlighted-text"> HTML, CSS </span>
            and
            <span class="highlighted-text"> Javascript</span>.
        </p>
        <p>
            Currently my main goal is Mobile Development with
            <span class="highlighted-text"> Flutter, Firebase </span>
            and
            <span class="highlighted-text"> Golang</span>.
             As database I use
            <span class="highlighted-text"> MongoDB</span>
            or
            <span class="highlighted-text"> PostgreSQL</span>
            and I containerize it all with
            <span class="highlighted-text"> Docker </span>

        </p>
        <p>
            I am not a big fan of being only a 'code writer', that's the reason why 
            I've been learning basics of Assembly language. I want to understand truely 
            how the computer works, so I can code much better optimalized applications! 
        </p>

    </section>
    <aside>
        <picture>
            <img src="images/myself.webp" alt="myself" width="100%" height="100%"/>
        </picture>
    </aside>
</main>

<style lang="scss">
  main {
    display: flex;
    max-width: 70%;
    margin: 5em auto;
    justify-content: center;
    align-items: center;
    font-weight: 300;

    section {
      justify-content: center;
      max-width: 65%;
      font-size: 1.25em;
      padding: 0 2em;
      letter-spacing: 1px;
      word-spacing: 5px;

      section {
        display: none;
      }
    }

    aside {
      display: none;
    }

  }

  @media(max-width: 600px) {
    main {
      margin: 3em auto;
      max-width: 95%;

      section {
        max-width: 100%;

        section {
          display: flex;
          margin-bottom: 2em;

          img {
            border-radius: 50%;
          }
        }
      }
    }

  }

  @media(min-width: 600px) {
    main {
      aside {
        display: flex;
        margin-left: 3em;

        img {
          border-radius: 50%;
        }
      }
    }
  }

</style>
