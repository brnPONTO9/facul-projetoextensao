import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import "./VisionPlus.css";

/* ══════════════════════════════════════════════
   SPEECH
══════════════════════════════════════════════ */
const SpeechCtx = createContext(null);

function useSpeechEngine() {
  const [speaking, setSpeaking]       = useState(false);
  const [currentText, setCurrentText] = useState("");
  const ref = useRef(null);

  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (ref.current?._text === text) {
      setSpeaking(false); setCurrentText(""); ref.current = null; return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR"; u.rate = 0.93; u.pitch = 1.05; u._text = text;
    const pick = () => {
      const v = window.speechSynthesis.getVoices();
      const pt = v.find(x => x.lang === "pt-BR") || v.find(x => x.lang.startsWith("pt"));
      if (pt) u.voice = pt;
    };
    pick();
    if (!window.speechSynthesis.getVoices().length)
      window.speechSynthesis.onvoiceschanged = pick;
    u.onstart = () => { setSpeaking(true);  setCurrentText(text); };
    u.onend   = () => { setSpeaking(false); setCurrentText("");   ref.current = null; };
    u.onerror = () => { setSpeaking(false); setCurrentText("");   ref.current = null; };
    ref.current = u;
    window.speechSynthesis.speak(u);
  }, []);

  return { speak, speaking, currentText };
}

function Speakable({ text, children, as: Tag = "span" }) {
  const { speak, currentText } = useContext(SpeechCtx);
  const active = currentText === text;
  return (
    <Tag
      className={`speakable${active ? " speaking" : ""}`}
      tabIndex={0}
      onMouseEnter={() => speak(text)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); speak(text); }
      }}
      aria-label={`Ouvir: ${text}`}
    >
      {children}
    </Tag>
  );
}

const WAVE_H = [10, 18, 14, 20, 12];
function SpeakingBar() {
  const { speaking, currentText } = useContext(SpeechCtx);
  const preview = currentText
    ? `"${currentText.substring(0, 48)}${currentText.length > 48 ? "…" : ""}"`
    : "Lendo em voz alta...";
  return (
    <div role="status" aria-live="polite" className={`speaking-bar${speaking ? " visible" : ""}`}>
      <div className="wave-bars" aria-hidden="true">
        {WAVE_H.map((h, i) => (
          <span key={i} className="wave-bar" style={{ height: h, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <span>{preview}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   LOGO MARK
══════════════════════════════════════════════ */
function LogoMark({ size = 28 }) {
  return (
    <div className="nav__logo-mark" style={{ width: size, height: size, borderRadius: size * 0.25 }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3.5" fill="#080808" />
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="#080808" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════
   NAV
══════════════════════════════════════════════ */
const NAV_LINKS = ["O que fazemos", "Tecnologia", "Galeria", "Depoimentos"];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Navegação principal">
        <div className="nav__logo">
          <LogoMark size={32} />
          VisionPlus
        </div>

        <ul className="nav__links" role="list">
          {NAV_LINKS.map(l => (
            <li key={l}><a href="#" className="nav__link">{l}</a></li>
          ))}
        </ul>

        <button className="nav__cta" aria-label="Começar grátis">
          <span className="nav__cta-dot" aria-hidden="true" />
          Começar grátis
        </button>

        <button
          className={`nav__toggle${open ? " open" : ""}`}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`nav__mobile${open ? " open" : ""}`} aria-hidden={!open}>
        {NAV_LINKS.map(l => (
          <a key={l} href="#" className="nav__link" onClick={() => setOpen(false)}>{l}</a>
        ))}
        <button className="btn-accent" onClick={() => setOpen(false)}>
          Começar grátis
        </button>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   TICKER
══════════════════════════════════════════════ */
const TICKER_ITEMS = [
  "Tecnologia assistiva",
  "Leitura de tela com IA",
  "Ampliação inteligente",
  "Descrição de imagens",
  "Suporte em português",
  "Inclusão digital",
  "Baixa visão",
  "Deficiência visual",
];

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {doubled.map((t, i) => (
          <span key={i} className="ticker__item">
            <span className="ticker__accent">✦</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
const SLIDES = [
  { bg: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80", caption: "Independência digital", sub: "Tecnologia que abre portas" },
  { bg: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80", caption: "Cada detalhe importa",    sub: "Visão ampliada com precisão" },
  { bg: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=1200&q=80", caption: "Guiado pela voz",         sub: "Ouça o mundo ao redor" },
  { bg: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=1200&q=80", caption: "Aprender sem limites",    sub: "Educação acessível para todos" },
];

function Hero() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero" aria-label="Seção principal">
      {/* Full-bleed slideshow background */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {SLIDES.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${s.bg})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: i === slide ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
            role="img"
            aria-label={s.caption}
          />
        ))}
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.75) 40%, rgba(8,8,8,0.3) 100%)" }} />
        {/* Accent glow */}
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(125,249,170,0.05)", filter: "blur(100px)", pointerEvents: "none" }} />
      </div>

      {/* Big BG number */}
      <div className="hero__bg-num" aria-hidden="true">01</div>

      {/* Content */}
      <div className="hero__label">
        <span className="hero__label-line" aria-hidden="true" />
        Tecnologia Assistiva · 2025
      </div>

      <h1 className="hero__title">
        <span className="hero__title-plain">Quando a visão</span>
        <span className="hero__title-accent">tem outros</span>
        <span className="hero__title-italic">caminhos.</span>
      </h1>

      <div className="hero__bottom">
        <p className="hero__desc">
          <Speakable text="Plataforma de tecnologia assistiva para pessoas com deficiência visual e baixa visão. Porque autonomia não deveria depender de quanto você enxerga.">
            Plataforma de tecnologia assistiva para pessoas com deficiência visual e baixa visão.
            Porque autonomia não deveria depender de quanto você enxerga.
          </Speakable>
        </p>

        <div className="hero__actions">
          <div className="hero__btns">
            <button className="btn-accent">Começar grátis →</button>
            <button className="btn-ghost">Ver demonstração</button>
          </div>
          <p className="hero__meta">
            <strong>+12.400</strong> usuários · <strong>4.9★</strong> avaliação
          </p>
        </div>
      </div>

      {/* Slide dots */}
      <div style={{ position: "absolute", bottom: "2rem", right: "3rem", display: "flex", gap: 8, zIndex: 2 }} aria-hidden="true">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            style={{
              width: i === slide ? 24 : 6, height: 6,
              borderRadius: 99, border: "none", cursor: "pointer",
              background: i === slide ? "var(--accent)" : "rgba(255,255,255,0.2)",
              transition: "width .35s, background .35s",
            }}
          />
        ))}
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <div className="hero__scroll-bar" />
        <span className="hero__scroll-label">scroll</span>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   STATS
══════════════════════════════════════════════ */
const STATS = [
  { num: "285", unit: "M", label: "pessoas com deficiência visual no mundo" },
  { num: "6,5", unit: "M", label: "brasileiros com baixa visão" },
  { num: "80",  unit: "%", label: "dos casos são evitáveis ou tratáveis" },
  { num: "12",  unit: "k+", label: "usuários ativos na plataforma" },
];

function Stats() {
  return (
    <div className="stats" aria-label="Estatísticas de impacto">
      {STATS.map(s => (
        <div className="stat" key={s.num + s.unit}>
          <span className="stat__num">
            {s.num}<span className="accent">{s.unit}</span>
          </span>
          <span className="stat__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SERVICES
══════════════════════════════════════════════ */
const SERVICES = [
  { icon: "⊕", num: "01", title: "Ampliação inteligente",    speech: "Ampliação inteligente de tela. Zoom adaptativo que mantém o contexto visual sem distorcer o conteúdo, funcionando em qualquer aplicativo.", desc: "Zoom adaptativo que preserva contexto. Segue o cursor, o texto digitado e o foco automaticamente." },
  { icon: "◎", num: "02", title: "Leitura de tela por IA",   speech: "Leitura de tela por inteligência artificial com narração natural em português brasileiro, para todos os elementos da interface.", desc: "Narração natural em português. Lê menus, botões, formulários e conteúdo web sem configuração." },
  { icon: "◈", num: "03", title: "Contraste e cores",        speech: "Contraste e personalização visual. Perfis de cor para daltonismo, fotofobia e visão tubular, ajustáveis em tempo real.", desc: "Perfis para daltonismo, fotofobia e visão tubular. Ajuste em tempo real sem reiniciar apps." },
  { icon: "◉", num: "04", title: "Câmera e descrição",       speech: "Câmera com descrição de imagens em tempo real. Nossa inteligência artificial descreve cenas, rostos, textos e ambientes ao redor.", desc: "IA descreve cenas, rostos, textos e ambientes. Funciona offline para privacidade total." },
  { icon: "◐", num: "05", title: "Voz e atalhos",            speech: "Comandos de voz e atalhos de teclado. Controle total da interface sem usar o mouse, totalmente personalizável.", desc: "Controle total por voz ou teclado. Sem mouse, sem barreiras. Totalmente personalizável." },
  { icon: "◑", num: "06", title: "OCR e documentos",         speech: "OCR e leitura de documentos físicos, PDFs e imagens com texto em mais de 30 idiomas.", desc: "Reconhece e lê documentos físicos, PDFs, imagens e placas em mais de 30 idiomas." },
];

function Services() {
  return (
    <section className="section" id="o-que-fazemos" aria-label="O que fazemos">
      <div className="services-header">
        <div>
          <div className="section__eyebrow">
            <span className="section__eyebrow-tick" aria-hidden="true" />
            O que fazemos
          </div>
          <h2 className="section__title">
            Ferramentas que<br /><em>devolvem</em> autonomia
          </h2>
        </div>
        <div>
          <div className="voice-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            Passe o mouse para ouvir
          </div>
          <p className="section__subtitle">
            <Speakable text="Seis ferramentas integradas, projetadas para diferentes graus de deficiência visual, funcionando juntas em qualquer dispositivo.">
              Seis ferramentas integradas, projetadas para diferentes graus de deficiência visual,
              funcionando juntas em qualquer dispositivo.
            </Speakable>
          </p>
        </div>
      </div>

      <div className="services-grid">
        {SERVICES.map(s => (
          <article className="service-card" key={s.num}>
            <div className="service-card__num">{s.num}</div>
            <span className="service-card__icon" aria-hidden="true">{s.icon}</span>
            <h3 className="service-card__title">
              <Speakable text={s.speech}>{s.title}</Speakable>
            </h3>
            <p className="service-card__desc">{s.desc}</p>
            <span className="service-card__arrow">Saiba mais →</span>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════ */
const STEPS = [
  { n: "01", title: "Crie sua conta",        desc: "Cadastro em menos de 2 minutos. Sem cartão de crédito. Escolha entre plano gratuito ou premium com todos os recursos." },
  { n: "02", title: "Configure seu perfil",  desc: "Informe seu tipo de deficiência visual e personalize cada ferramenta de acordo com sua necessidade específica." },
  { n: "03", title: "Use em todo lugar",     desc: "Web, iOS, Android e extensão de navegador. Sincronizado em todos os dispositivos, funcionando até offline." },
];

function HowItWorks() {
  return (
    <section className="section section--alt" id="tecnologia" aria-label="Como funciona">
      <div className="section__eyebrow">
        <span className="section__eyebrow-tick" aria-hidden="true" />
        Passo a passo
      </div>
      <h2 className="section__title">Simples de<br /><em>começar</em></h2>

      <div className="steps">
        {STEPS.map(s => (
          <div className="step" key={s.n}>
            <div className="step__connector" aria-hidden="true" />
            <div className="step__num">
              <div className="step__num-circle" aria-hidden="true">{s.n}</div>
              PASSO {s.n}
            </div>
            <h3 className="step__title">{s.title}</h3>
            <p className="step__desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   GALLERY
══════════════════════════════════════════════ */
const GALLERY = [
  { type: "wide", src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80", title: "Leitura assistida",     sub: "IA que narra o mundo" },
  { type: "tall", src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80",   title: "Conexão humana",         sub: "Autonomia real" },
  { type: "wide", src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80", title: "Tecnologia inclusiva",  sub: "Para todos os graus" },
  { type: "tall", src: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=600&q=80", title: "Mobilidade",             sub: "Em qualquer lugar" },
  { type: "wide", src: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=900&q=80", title: "Educação acessível",    sub: "Aprender sem barreiras" },
  { type: "tall", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80", title: "Digital sem limites",   sub: "OCR e reconhecimento" },
];

const VISIBLE_COUNT = 3;

function Gallery() {
  const [offset, setOffset]     = useState(0);
  const [fading, setFading]     = useState(false);

  const slide = (dir) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setOffset(p => {
        const next = p + dir;
        if (next < 0) return GALLERY.length - VISIBLE_COUNT;
        if (next > GALLERY.length - VISIBLE_COUNT) return 0;
        return next;
      });
      setFading(false);
    }, 250);
  };

  const visible = GALLERY.slice(offset, offset + VISIBLE_COUNT);

  return (
    <section className="section" id="galeria" aria-label="Galeria">
      <div className="gallery__header">
        <div>
          <div className="section__eyebrow">
            <span className="section__eyebrow-tick" aria-hidden="true" />
            Galeria
          </div>
          <h2 className="section__title">Veja na <em>prática</em></h2>
        </div>
        <div className="gallery__nav">
          <button className="gallery__btn" onClick={() => slide(-1)} aria-label="Anterior">←</button>
          <button className="gallery__btn" onClick={() => slide(1)}  aria-label="Próxima">→</button>
        </div>
      </div>

      <div
        className="gallery__track"
        aria-live="polite"
        style={{ opacity: fading ? 0 : 1, transition: "opacity .25s ease" }}
      >
        {visible.map((item, i) => (
          <div key={`${offset}-${i}`} className={`gallery__slide gallery__slide--${item.type}`}>
            <div className="gallery__slide-img" style={{ backgroundImage: `url(${item.src})` }} role="img" aria-label={item.title} />
            <div className="gallery__slide-overlay" aria-hidden="true" />
            <div className="gallery__slide-caption">
              <h4>{item.title}</h4>
              <p>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="gallery__dots" aria-hidden="true">
        {GALLERY.map((_, i) => (
          <button key={i} className={`gallery__dot${i === offset ? " active" : ""}`} onClick={() => setOffset(i)} />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   BENTO GRID
══════════════════════════════════════════════ */
function Bento() {
  return (
    <section className="section section--alt" aria-label="Recursos em destaque">
      <div className="section__eyebrow" style={{ marginBottom: "1.25rem" }}>
        <span className="section__eyebrow-tick" aria-hidden="true" />
        Por que o VisionPlus
      </div>
      <h2 className="section__title" style={{ marginBottom: "3rem" }}>
        Tudo que você<br /><em>precisa</em>, junto
      </h2>

      <div className="bento">
        {/* Cell A — large image */}
        <div className="bento__cell bento__cell--a">
          <div className="bento__img-wrap">
            <div
              className="bento__img"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80)" }}
              role="img"
              aria-label="Pessoa usando tecnologia assistiva"
            />
            <div className="bento__img-overlay" aria-hidden="true" />
          </div>
          <div className="bento__label">Leitura de tela</div>
          <div className="bento__title">
            <Speakable text="Nossa inteligência artificial narra qualquer interface em português natural, sem robotização.">
              Nossa IA narra qualquer interface em português natural, sem robotização.
            </Speakable>
          </div>
        </div>

        {/* Cell B — stat */}
        <div className="bento__cell bento__cell--b" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="bento__label">Satisfação dos usuários</div>
            <div className="bento__stat-big">98<span className="accent">%</span></div>
            <div className="bento__stat-sub">de aprovação · 4.9★ na App Store</div>
          </div>
          <div>
            <div className="bento__label" style={{ marginTop: "2rem" }}>Compatível com</div>
            <div className="bento__tags">
              {["iOS", "Android", "Chrome", "Firefox", "Windows", "macOS"].map(t => (
                <span key={t} className="bento__tag">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Cell C */}
        <div className="bento__cell bento__cell--c">
          <div className="bento__img-wrap" style={{ aspectRatio: "1/1" }}>
            <div
              className="bento__img"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80)" }}
              role="img"
              aria-label="Tecnologia de câmera"
            />
          </div>
          <div className="bento__label">Câmera IA</div>
          <div className="bento__title">Descreve o mundo ao redor</div>
          <div className="bento__desc">Aponte e ouça. Rostos, textos, objetos, ambientes.</div>
        </div>

        {/* Cell D */}
        <div className="bento__cell bento__cell--d" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="bento__stat-big" style={{ fontSize: "3rem" }}>30<span className="accent">+</span></div>
          <div className="bento__stat-sub">idiomas suportados pelo OCR</div>
          <div className="bento__desc" style={{ marginTop: "1rem" }}>
            <Speakable text="Lê documentos físicos, PDFs e imagens em qualquer idioma, com alta precisão mesmo em baixa qualidade.">
              Lê documentos físicos, PDFs e imagens em qualquer idioma, com alta precisão mesmo em baixa qualidade.
            </Speakable>
          </div>
        </div>

        {/* Cell E */}
        <div className="bento__cell bento__cell--e">
          <div className="bento__label">Privacidade</div>
          <div className="bento__title">Seus dados ficam com você</div>
          <div className="bento__desc">Processamento local disponível. LGPD compliant. Sem venda de dados para terceiros.</div>
          <div className="bento__tags" style={{ marginTop: "1.5rem" }}>
            {["LGPD", "WCAG 2.1", "ISO 30071"].map(t => (
              <span key={t} className="bento__tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════ */
const TESTIMONIALS = [
  { quote: "A VisionPlus me devolveu a independência de ler por conta própria. Tenho apenas 8% de visão e consegui voltar ao mercado de trabalho.",          name: "Carlos Andrade",  role: "Analista de dados · São Paulo",    initials: "CA", color: "#7DF9AA" },
  { quote: "Sofro de degeneração macular e a ampliação inteligente foi um divisor de águas. Finalmente uso o celular sem pedir ajuda.",                       name: "Maria Silva",     role: "Aposentada · Belo Horizonte",      initials: "MS", color: "#a78bfa" },
  { quote: "Como professor com baixa visão, a descrição de imagens mudou minha vida em sala de aula. Preparo materiais com muito mais autonomia.",            name: "Rafael Oliveira", role: "Professor · Recife",               initials: "RO", color: "#f59e0b" },
  { quote: "Uso há 6 meses e não consigo imaginar minha rotina sem o app. A leitura de documentos economiza horas do meu dia.",                              name: "Ana Costa",       role: "Advogada · Porto Alegre",          initials: "AC", color: "#fb7185" },
  { quote: "Meu filho tem albinismo. Com o VisionPlus ele estuda de forma independente pela primeira vez na vida. Impossível descrever a emoção.",            name: "Paulo Mendes",    role: "Pai de usuário · Fortaleza",       initials: "PM", color: "#38bdf8" },
  { quote: "O suporte em português é perfeito. A voz soa natural e o reconhecimento de texto funciona mesmo com imagens de baixa qualidade.",                name: "Beatriz Lima",    role: "Estudante universitária · Manaus", initials: "BL", color: "#34d399" },
];

function Testimonials() {
  return (
    <section className="section" id="depoimentos" aria-label="Depoimentos">
      <div className="section__eyebrow" style={{ marginBottom: "1.25rem" }}>
        <span className="section__eyebrow-tick" aria-hidden="true" />
        Depoimentos
      </div>
      <h2 className="section__title" style={{ marginBottom: "3rem" }}>
        Quem usa,<br /><em>transforma</em>
      </h2>

      <div className="testimonials-grid">
        {TESTIMONIALS.map(t => (
          <article className="testimonial-card" key={t.name}>
            <div className="testimonial-card__quote" aria-hidden="true">"</div>
            <p className="testimonial-card__text">
              <Speakable text={t.quote}>{t.quote}</Speakable>
            </p>
            <div className="testimonial-card__meta">
              <div
                className="testimonial-avatar"
                style={{ background: t.color }}
                aria-hidden="true"
              >
                {t.initials}
              </div>
              <div>
                <p className="testimonial-name">{t.name}</p>
                <p className="testimonial-role">{t.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   CTA
══════════════════════════════════════════════ */
function CTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);

  const handleSubmit = () => {
    if (email.includes("@")) { setSent(true); setEmail(""); }
  };

  return (
    <section className="cta" aria-label="Comece a usar o VisionPlus">
      <div className="cta__glow-1" aria-hidden="true" />
      <div className="cta__glow-2" aria-hidden="true" />

      <div className="cta__inner">
        <div className="section__eyebrow" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
          <span className="section__eyebrow-tick" aria-hidden="true" />
          Comece hoje
        </div>

        <h2 className="cta__title">
          Autonomia<br />não é<br /><em>luxo.</em>
        </h2>

        <p className="cta__subtitle">
          30 dias gratuitos. Sem cartão de crédito.<br />
          Cancele quando quiser.
        </p>

        {sent ? (
          <div style={{ color: "var(--accent)", fontSize: "1rem", fontWeight: 500, padding: "1rem" }}>
            ✓ Perfeito! Entraremos em contato em breve.
          </div>
        ) : (
          <div className="cta__form">
            <input
              className="cta__input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              aria-label="Seu endereço de e-mail"
            />
            <button className="btn-accent" onClick={handleSubmit}>
              Testar grátis →
            </button>
          </div>
        )}

        <p className="cta__note">✓ 30 dias grátis &nbsp;·&nbsp; ✓ Sem cartão &nbsp;·&nbsp; ✓ Cancele quando quiser</p>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════ */
const FOOTER_COLS = [
  { title: "Produto",  links: ["Recursos", "Planos e preços", "API para devs", "Changelog", "Status"] },
  { title: "Empresa",  links: ["Sobre nós", "Blog", "Carreiras", "Imprensa", "Parceiros"] },
  { title: "Suporte",  links: ["Central de ajuda", "Contato", "Acessibilidade", "Privacidade", "Termos de uso"] },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <div className="footer__brand-name">
            <div className="footer__brand-mark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="3.5" fill="#080808" />
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="#080808" strokeWidth="2" fill="none" />
              </svg>
            </div>
            VisionPlus
          </div>
          <p>Tecnologia assistiva de ponta para pessoas com deficiência visual. Inclusão digital que transforma vidas.</p>
        </div>

        {FOOTER_COLS.map(col => (
          <div className="footer__col" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">© 2025 VisionPlus. Todos os direitos reservados.</p>
        <div className="footer__badges">
          {["WCAG 2.1 AA", "LGPD", "ISO 30071-1"].map(b => (
            <div key={b} className="footer__badge">{b}</div>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════
   APP
══════════════════════════════════════════════ */
export default function App() {
  const speech = useSpeechEngine();
  return (
    <SpeechCtx.Provider value={speech}>
      <a href="#main" className="skip-link">Ir para o conteúdo principal</a>
      <SpeakingBar />
      <Nav />
      <Ticker />
      <main id="main">
        <Hero />
        <Stats />
        <Services />
        <HowItWorks />
        <Gallery />
        <Bento />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </SpeechCtx.Provider>
  );
}
