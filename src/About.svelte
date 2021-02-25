<main>
    <section>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean viverra euismod euismod. Nam eu lacinia neque.
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sapien nibh, sagittis eu lectus vitae, tempus accumsan
        neque. Nam ultricies justo nec erat finibus, sed sollicitudin urna porta. Donec egestas, elit nec ullamcorper semper,
        dolor ex consequat nulla, ac blandit tortor justo ut massa. Mauris finibus consectetur augue, vel congue lorem faucibus vel.
        Praesent quis tempus mauris, et bibendum massa. Proin a dolor tellus. In sit amet purus odio. Praesent mollis, nisl non
        ultricies sollicitudin, turpis sapien rutrum libero, vel aliquam purus nisl at magna.
    </section>
    <aside>
        <img src="images/myself.png" alt="Image of myself"/>
    </aside>
</main>

<style lang="scss">
  main {
    display: flex;
    max-width: 70%;
    margin: 5em auto;
    justify-content: center;
    align-items:center;
    font-weight:300;

    section {
      justify-content: center;
      max-width: 65%;
      font-size:1.25em;
      padding:0 2em;
      letter-spacing:1px;
      word-spacing:5px;
    }

    aside {
      display: flex;
      margin-left:3em;
      img {
        border-radius:50%;
      }
    }
  }


</style>
