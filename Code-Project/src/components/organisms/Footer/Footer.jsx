import { useEffect, useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollThreshold = 100; // Pixel di scroll prima che compaia
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        if (scrollTop > scrollThreshold) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(true);
      }
    };

    // Debounce per ottimizzare le performance
    let scrollTimeout;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 10);
    };

    if (window.innerWidth >= 768) {
      setIsVisible(true);
    }

    window.addEventListener("scroll", debouncedScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      window.removeEventListener("resize", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <footer className={`app-footer ${isVisible ? "visible" : ""}`}>
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
            <img src="/instagram-brands-solid-full.svg" alt="Instagram" />
          </a>
          <a
            href="https://github.com/vincenzocrucitti04-hash"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visita il mio GitHub (si apre in una nuova finestra)"
          >
            <img src="/github-brands-solid-full.svg" alt="GitHub" />
          </a>
          <a
            href="https://www.linkedin.com/in/vincenzo-crucitti-4b5428378/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Collegati su LinkedIn (si apre in una nuova finestra)"
          >
            <img src="/linkedin-brands-solid-full.svg" alt="LinkedIn" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
