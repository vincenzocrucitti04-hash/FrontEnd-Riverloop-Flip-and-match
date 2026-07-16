import "./Footer.css";

function Footer() {
  return (
    <footer className="system-footer">
      <p>Dati Pokémon forniti da PokéAPI</p>
      <nav
        className="system-footer__socials"
        aria-label="Collegamenti sociali"
      >
        <a
          href="https://www.instagram.com/imvinz_04/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Seguimi su Instagram (si apre in una nuova finestra)"
        >
          <img src="/instagram-brands-solid-full.svg" alt="" />
        </a>
        <a
          href="https://github.com/vincenzocrucitti04-hash"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visita il mio GitHub (si apre in una nuova finestra)"
        >
          <img src="/github-brands-solid-full.svg" alt="" />
        </a>
        <a
          href="https://www.linkedin.com/in/vincenzo-crucitti-4b5428378/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Collegati su LinkedIn (si apre in una nuova finestra)"
        >
          <img src="/linkedin-brands-solid-full.svg" alt="" />
        </a>
      </nav>
    </footer>
  );
}

export default Footer;
