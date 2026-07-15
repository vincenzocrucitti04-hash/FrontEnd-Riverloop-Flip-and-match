import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-title">FrontEnd - Riverloop - Flip & Match</p>
        <p className="footer-text">
          Un classico gioco di memoria per tutti. Allenati a trovare le coppie!
        </p>
        <p className="footer-developed">
          Sviluppato come progetto finale per FrontEnd di Riverloop. © 2025
        </p>
      </div>

      <div className="footer-contacts">
        <h3 className="title-contacts">Contatti:</h3>
        <div
          className="social-icons-footer"
          role="complementary"
          aria-label="Link ai social media nel footer"
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
        </div>
      </div>
    </footer>
  );
}

export default Footer;
