import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import "./VisionPlus.css";

/* ══════════════════════════════════════════════════════
   SPEECH HOOK & CONTEXT
══════════════════════════════════════════════════════ */
const SpeechCtx = createContext(null);

function useSpeechEngine() {
  const [speaking, setSpeaking]     = useState(false);
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
    if (!window.speechSynthesis.getVoices().length) window.speechSynthesis.onvoiceschanged = pick;
    u.onstart = () => { setSpeaking(true);  setCurrentText(text); };
    u.onend   = () => { setSpeaking(false); setCurrentText("");   ref.current = null; };
    u.onerror = () => { setSpeaking(false); setCurrentText("");   ref.current = null; };
    ref.current = u;
    window.speechSynthesis.speak(u);
  }, []);

  return { speak, speaking, currentText };
}

/* ══════════════════════════════════════════════════════
   SPEAKABLE COMPONENT
══════════════════════════════════════════════════════ */
function Speakable({ text, children, as: Tag = "span" }) {
  const { speak, currentText } = useContext(SpeechCtx);
  const active = currentText === text;
  return (
    <Tag
      className={`speakable${active ? " speaking" : ""}`}
      tabIndex={0}
      onMouseEnter={() => speak(text)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); speak(text); } }}
      aria-label={`Ouvir: ${text}`}
    >
      {children}
    </Tag>
  );
}

/* ══════════════════════════════════════════════════════
   SPEAKING BAR
══════════════════════════════════════════════════════ */
const WAVE_H = [12, 20, 16, 22, 14];
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

/* ══════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════ */
const NAV_LINKS = ["O que fazemos", "Tecnologia", "Galeria", "Depoimentos"];

function LogoSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="#fff" />
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="#fff" strokeWidth="2" fill="none" />
    </svg>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Navegação principal">
        <div className="nav__logo">
          <div className="nav__logo-icon"><LogoSVG /></div>
          PROJETO FACUL
        </div>
        <ul className="nav__links" role="list">
          {NAV_LINKS.map(l => <li key={l}><a href="#" className="nav__link">{l}</a></li>)}
        </ul>
        <button className={`nav__toggle${open ? " open" : ""}`} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(v => !v)}>
          <span /><span /><span />
        </button>
      </nav>
      <div className={`nav__mobile${open ? " open" : ""}`} aria-hidden={!open}>
        {NAV_LINKS.map(l => <a key={l} href="#" className="nav__link" onClick={() => setOpen(false)}>{l}</a>)}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   TICKER
══════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  "Tecnologia assistiva de ponta",
  "Leitura de tela com IA",
  "Ampliação inteligente",
  "Descrição de imagens em tempo real",
  "Suporte ao português brasileiro",
  "Acessibilidade para todos",
];
function Ticker() {
  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker" aria-label="Recursos da plataforma">
      <div className="ticker__track">
        {repeated.map((t, i) => (
          <span key={i} className="ticker__item">
            <span className="ticker__dot" aria-hidden="true" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HERO SLIDESHOW
══════════════════════════════════════════════════════ */
const SLIDES = [
  {
    bg: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&q=80",
    title: "Independência digital",
    sub: "Tecnologia que abre portas",
  },
  {
    bg: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80",
    title: "Visão ampliada",
    sub: "Cada detalhe importa",
  },
  {
    bg: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80",
    title: "Conexão e inclusão",
    sub: "Ninguém fica para trás",
  },
  {
    bg: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=900&q=80",
    title: "Guiado pela voz",
    sub: "Ouça o mundo ao redor",
  },
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const timerRef = useRef(null);

  const go = useCallback((idx) => {
    setCurrent(idx);
    setBarWidth(0);
    setTimeout(() => setBarWidth(100), 30);
  }, []);

  useEffect(() => {
    setBarWidth(100);
    timerRef.current = setInterval(() => {
      setCurrent(p => {
        const next = (p + 1) % SLIDES.length;
        setBarWidth(0);
        setTimeout(() => setBarWidth(100), 30);
        return next;
      });
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="hero__visual">
      <div className="hero__card hero__card--main">
        <div className="hero__slides">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={`hero__slide${i === current ? " active" : ""}`}
              style={{ backgroundImage: `url(${s.bg})` }}
              role="img"
              aria-label={s.title}
            >
              <div className="hero__slide-overlay" />
              <div className="hero__slide-caption">
                <h3>{s.title}</h3>
                <p>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating cards */}
      <div className="hero__card hero__card--float-1">
        <div className="hero__float-label">Usuários ativos</div>
        <div className="hero__float-value">12.4k</div>
        <div className="hero__float-sub">↑ 24% este mês</div>
        <div className="hero__float-bar">
          <div className="hero__float-fill" style={{ width: "72%" }} />
        </div>
      </div>

      <div className="hero__card hero__card--float-2">
        <div className="hero__float-label">Satisfação</div>
        <div className="hero__float-value">98%</div>
        <div className="hero__float-sub">⭐ 4.9 / 5.0</div>
      </div>

      {/* Dots */}
      <div className="hero__dots" role="tablist" aria-label="Slides">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero__dot${i === current ? " active" : ""}`}
            onClick={() => go(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════ */
const TRUST_AVATARS = [
  { initials: "CA", color: "#10a36e" },
  { initials: "MS", color: "#6366f1" },
  { initials: "RO", color: "#f59e0b" },
  { initials: "BL", color: "#ec4899" },
];

function Hero() {
  return (
    <section className="hero" aria-label="Seção principal">
      {/* Decorative background */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__bg-circle" style={{ width: 500, height: 500, background: "radial-gradient(circle,rgba(15,168,109,0.07),transparent 70%)", top: "10%", right: "-10%" }} />
        <div className="hero__bg-circle" style={{ width: 300, height: 300, background: "radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)", bottom: "5%", left: "-5%" }} />
      </div>

      {/* Left */}
      <div className="hero__left">
        <div className="hero__badge">
          <div className="hero__badge-dot"><LogoSVG /></div>
          Tecnologia Assistiva
        </div>

        <h1 className="hero__title">
          <span className="hero__title-line"><span>Enxergar o mundo</span></span>
          <span className="hero__title-line"><span>de <em>outro jeito</em></span></span>
          <span className="hero__title-line"><span>também é ver.</span></span>
        </h1>

        <p className="hero__desc">
          Soluções digitais criadas para pessoas com baixa visão e deficiência visual.
          Porque cada grau de visão merece o melhor em acessibilidade.
        </p>

        <div className="hero__btns">
          <button className="btn btn--primary">Explorar recursos</button>
          <button className="btn btn--outline">Como funciona →</button>
        </div>

        <div className="hero__trust">
          <div className="hero__trust-avatars">
            {TRUST_AVATARS.map(a => (
              <div key={a.initials} className="hero__trust-avatar" style={{ background: a.color }}>{a.initials}</div>
            ))}
          </div>
          <div>
            <span className="hero__trust-stars">★★★★★ </span>
            <strong>+12.000</strong> pessoas já usam
          </div>
        </div>
      </div>

      {/* Right: slideshow */}
      <div className="hero__right">
        <HeroSlideshow />
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════ */
const STATS = [
  { num: "285M",  label: "pessoas com deficiência visual no mundo" },
  { num: "6,5M",  label: "brasileiros com baixa visão" },
  { num: "80%",   label: "dos casos são evitáveis ou tratáveis" },
  { num: "+12k",  label: "usuários ativos na plataforma" },
];

function Stats() {
  return (
    <div className="stats" aria-label="Estatísticas de impacto">
      {STATS.map(s => (
        <div className="stat" key={s.num}>
          <span className="stat__num">{s.num}</span>
          <span className="stat__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SERVICES (O que fazemos)
══════════════════════════════════════════════════════ */
const SERVICES = [
  { icon: "🔍", title: "Ampliação inteligente de tela",       speech: "Ampliação inteligente de tela. Zoom adaptativo que mantém o contexto visual sem distorcer o conteúdo, funcionando em qualquer aplicativo.",                                        desc: "Zoom adaptativo que mantém o contexto visual sem distorcer o conteúdo. Funciona em qualquer aplicativo." },
  { icon: "🎙️", title: "Leitura de tela por IA",             speech: "Leitura de tela por inteligência artificial. Narração natural e contextual para todos os elementos da tela, com suporte completo ao português brasileiro.",                        desc: "Narração natural e contextual para todos os elementos da tela. Suporte completo ao português brasileiro." },
  { icon: "🎨", title: "Contraste e personalização visual",   speech: "Contraste e personalização visual. Perfis de cor acessíveis para daltonismo, fotofobia, visão tubular e muito mais.",                                                              desc: "Perfis de cor acessíveis para daltonismo, fotofobia, visão tubular e muito mais." },
  { icon: "📸", title: "Descrição de imagens em tempo real", speech: "Descrição de imagens em tempo real. Basta apontar a câmera e nossa inteligência artificial descreve o que está à sua frente com linguagem natural e precisa.",                  desc: "Basta apontar a câmera e nossa IA descreve o que está à sua frente, com precisão e linguagem natural." },
  { icon: "⌨️", title: "Comandos de voz e atalhos",          speech: "Comandos de voz e atalhos acessíveis. Controle total por voz ou teclado, sem depender do mouse, personalizável para cada necessidade.",                                           desc: "Controle total por voz ou teclado, sem depender do mouse. Personalizável para cada necessidade." },
  { icon: "📄", title: "OCR e leitura de documentos",        speech: "OCR e leitura de documentos. Reconhece e lê documentos físicos, PDFs e imagens com texto em mais de 30 idiomas.",                                                                  desc: "Reconhece e lê documentos físicos, PDFs e imagens com texto em mais de 30 idiomas." },
];

function Services() {
  return (
    <section className="section" aria-label="O que fazemos" id="o-que-fazemos">
      <div className="section__header">
        <div className="section__header-left">
          <p className="section__label">Nossa missão</p>
          <h2 className="section__title">O que nós <em>fazemos</em></h2>
          <p className="section__desc">
            <Speakable text="Desenvolvemos tecnologia que amplia a autonomia de pessoas com deficiência visual, combinando inteligência artificial com design centrado no usuário.">
              Desenvolvemos tecnologia que amplia a autonomia de pessoas com deficiência visual, combinando inteligência artificial com design centrado no usuário.
            </Speakable>
          </p>
        </div>
        <div className="voice-hint" aria-label="Dica de acessibilidade">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          Passe o mouse para ouvir
        </div>
      </div>

      <div className="services-grid">
        {SERVICES.map(s => (
          <article className="service-card" key={s.title}>
            <div className="service-card__icon" aria-hidden="true">{s.icon}</div>
            <h3 className="service-card__title">
              <Speakable text={s.speech}>{s.title}</Speakable>
            </h3>
            <p className="service-card__desc">{s.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════ */
const STEPS = [
  { n: "01", title: "Cadastre-se",       desc: "Crie sua conta em menos de 2 minutos, sem cartão de crédito. Escolha seu plano: gratuito ou premium." },
  { n: "02", title: "Configure seu perfil", desc: "Selecione seu tipo de deficiência visual e personalize as ferramentas de acordo com suas necessidades." },
  { n: "03", title: "Use em qualquer lugar", desc: "Acesse via web, app iOS e Android ou extensão de navegador. Sincronizado em todos os dispositivos." },
];

function HowItWorks() {
  return (
    <section className="section section--dark" aria-label="Como funciona" id="tecnologia">
      <p className="section__label">Passo a passo</p>
      <h2 className="section__title">Como <em>funciona</em></h2>
      <div className="steps">
        {STEPS.map(s => (
          <div className="step" key={s.n}>
            <div className="step__num" aria-hidden="true">{s.n}</div>
            <h3 className="step__title">{s.title}</h3>
            <p className="step__desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   GALLERY (rotação de imagens)
══════════════════════════════════════════════════════ */
const GALLERY_ITEMS = [
  { type: "wide", src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80", title: "Leitura assistida",      sub: "IA que narra o mundo" },
  { type: "tall", src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80", title: "Conexão humana",          sub: "Autonomia real" },
  { type: "wide", src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80", title: "Tecnologia inclusiva", sub: "Para todos os graus" },
  { type: "tall", src: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=600&q=80", title: "Mobilidade",            sub: "Em qualquer lugar" },
  { type: "wide", src: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=800&q=80", title: "Educação acessível",   sub: "Aprender sem barreiras" },
  { type: "tall", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80", title: "Digital sem limites",  sub: "OCR e reconhecimento" },
];

function Gallery() {
  const [offset, setOffset]   = useState(0);
  const [animating, setAnimating] = useState(false);
  const VISIBLE = 3;

  const slide = (dir) => {
    if (animating) return;
    setAnimating(true);
    setOffset(p => {
      const next = p + dir;
      if (next < 0) return GALLERY_ITEMS.length - VISIBLE;
      if (next > GALLERY_ITEMS.length - VISIBLE) return 0;
      return next;
    });
    setTimeout(() => setAnimating(false), 400);
  };

  const visible = GALLERY_ITEMS.slice(offset, offset + VISIBLE);

  return (
    <section className="section section--gray" aria-label="Galeria" id="galeria">
      <div className="gallery__header">
        <div>
          <p className="section__label">Galeria</p>
          <h2 className="section__title">Veja na <em>prática</em></h2>
        </div>
        <div className="gallery__nav">
          <button className="gallery__btn" onClick={() => slide(-1)} aria-label="Anterior">←</button>
          <button className="gallery__btn" onClick={() => slide(1)}  aria-label="Próxima">→</button>
        </div>
      </div>

      <div className="gallery__track" aria-live="polite">
        {visible.map((item, i) => (
          <div
            key={`${offset}-${i}`}
            className={`gallery__card gallery__card--${item.type}`}
            style={{ transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)", opacity: animating ? 0.7 : 1 }}
          >
            <div className="gallery__card-img" style={{ backgroundImage: `url(${item.src})` }} role="img" aria-label={item.title} />
            <div className="gallery__card-overlay" />
            <div className="gallery__card-info">
              <h4>{item.title}</h4>
              <p>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="gallery__progress" aria-hidden="true">
        {GALLERY_ITEMS.map((_, i) => (
          <div key={i} className="gallery__pip">
            <div className="gallery__pip-fill" style={{ width: i >= offset && i < offset + VISIBLE ? "100%" : "0%" }} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   FEATURE SPLIT
══════════════════════════════════════════════════════ */
function FeatureSplit() {
  return (
    <section className="section" aria-label="Funcionalidades principais">
      <div className="feature-split">
        {/* Visual */}
        <div className="feature__visual">
          <div
            className="feature__visual-img"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80)" }}
            role="img"
            aria-label="Pessoa usando tecnologia assistiva"
          />
          <div className="feature__badge">
            <div className="feature__badge-icon">🎙️</div>
            <div>
              <h4>Lendo agora…</h4>
              <p>"Seu e-mail foi enviado com sucesso."</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="section__label">Leitura de tela</p>
          <h2 className="section__title">Ouça tudo que <em>importa</em></h2>
          <div className="feature__list">
            {[
              { icon: "🔊", t: "Voz natural em português",    d: "Selecionamos automaticamente a melhor voz disponível para o idioma." },
              { icon: "⚡", t: "Resposta em milissegundos",   d: "Leitura instantânea ao focar em qualquer elemento da tela." },
              { icon: "🎛️", t: "Velocidade personalizável",   d: "Ajuste o ritmo da narração do seu jeito, de lento a ultrarrápido." },
              { icon: "🌐", t: "Mais de 30 idiomas",          d: "Troque o idioma a qualquer momento sem reiniciar o aplicativo." },
            ].map(f => (
              <div className="feature__item" key={f.t}>
                <div className="feature__item-icon" aria-hidden="true">{f.icon}</div>
                <div>
                  <h4>{f.t}</h4>
                  <p>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second split (reverse) */}
      <div className="feature-split feature-split--reverse" style={{ marginTop: "5rem" }}>
        <div className="feature__visual">
          <div
            className="feature__visual-img"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80)" }}
            role="img"
            aria-label="Tecnologia de câmera descrevendo imagens"
          />
          <div className="feature__badge">
            <div className="feature__badge-icon">📸</div>
            <div>
              <h4>IA identificou:</h4>
              <p>"Pessoa sorrindo, ao ar livre, dia ensolarado."</p>
            </div>
          </div>
        </div>
        <div>
          <p className="section__label">Visão artificial</p>
          <h2 className="section__title">Câmera que <em>descreve</em></h2>
          <div className="feature__list">
            {[
              { icon: "🧠", t: "IA multimodal avançada",    d: "Reconhece rostos, objetos, textos, cores e ambientes com alta precisão." },
              { icon: "🔤", t: "Leitura de textos no mundo", d: "Lê placas, cardápios, etiquetas e documentos em tempo real." },
              { icon: "📍", t: "Descrição de ambiente",      d: "Descreve o espaço ao redor para navegação com segurança." },
              { icon: "💬", t: "Narração em voz alta",       d: "Ouve a descrição da imagem sem precisar ver a tela." },
            ].map(f => (
              <div className="feature__item" key={f.t}>
                <div className="feature__item-icon" aria-hidden="true">{f.icon}</div>
                <div>
                  <h4>{f.t}</h4>
                  <p>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { quote: "A VisionPlus me devolveu a independência de ler por conta própria. Tenho apenas 8% de visão e consegui voltar ao mercado de trabalho.",         name: "Carlos Andrade", role: "Analista de dados, São Paulo",    initials: "CA", color: "#10a36e" },
  { quote: "Sofro de degeneração macular e a ampliação inteligente foi um divisor de águas. Finalmente consigo usar o celular sem pedir ajuda a ninguém.", name: "Maria Silva",    role: "Aposentada, Belo Horizonte",      initials: "MS", color: "#6366f1" },
  { quote: "Como professor com baixa visão, a descrição de imagens mudou minha vida na sala de aula. Preparo materiais com muito mais autonomia.",          name: "Rafael Oliveira", role: "Professor, Recife",              initials: "RO", color: "#f59e0b" },
  { quote: "Uso o VisionPlus há 6 meses e não consigo imaginar minha rotina sem ele. A leitura de documentos economiza horas do meu dia.",                  name: "Ana Costa",      role: "Advogada, Porto Alegre",          initials: "AC", color: "#ec4899" },
  { quote: "Meu filho tem albinismo e baixa visão. Com o app, ele consegue estudar de forma independente pela primeira vez na vida.",                        name: "Paulo Mendes",   role: "Pai de usuário, Fortaleza",       initials: "PM", color: "#14b8a6" },
  { quote: "O suporte em português é perfeito. A voz soa natural e o reconhecimento de texto é muito preciso mesmo com imagens de baixa qualidade.",        name: "Beatriz Lima",   role: "Estudante universitária, Manaus", initials: "BL", color: "#8b5cf6" },
];

function Testimonials() {
  return (
    <section className="section section--gray" aria-label="Depoimentos" id="depoimentos">
      <div className="section__header">
        <div className="section__header-left">
          <p className="section__label">Depoimentos</p>
          <h2 className="section__title">Quem usa, <em>transforma</em></h2>
          <p className="section__desc">Histórias reais de pessoas que encontraram mais autonomia e qualidade de vida com a VisionPlus.</p>
        </div>
      </div>
      <div className="testimonials-grid">
        {TESTIMONIALS.map(t => (
          <article className="testimonial-card" key={t.name}>
            <div className="testimonial-card__stars" aria-label="5 estrelas">★★★★★</div>
            <blockquote>
              <Speakable text={t.quote}>"{t.quote}"</Speakable>
            </blockquote>
            <div className="testimonial-meta">
              <div className="testimonial-avatar" style={{ background: t.color }} aria-hidden="true">{t.initials}</div>
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

/* ══════════════════════════════════════════════════════
   CTA
══════════════════════════════════════════════════════ */
function CTA() {
  const [email, setEmail] = useState("");
  const handleSubmit = () => {
    if (email.includes("@")) {
      alert(`Perfeito! Entraremos em contato em breve: ${email}`);
      setEmail("");
    }
  };
}

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */
const FOOTER_COLS = [
  { title: "Produto",    links: ["Recursos", "Planos", "API", "Changelog", "Status"] },
  { title: "Empresa",   links: ["Sobre nós", "Blog", "Carreiras", "Imprensa", "Parceiros"] },
  { title: "Suporte",   links: ["Central de ajuda", "Contato", "Acessibilidade", "Privacidade", "Termos"] },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div>
          <div className="footer__brand-name">
            <div className="footer__brand-logo"><LogoSVG /></div>
            VisionPlus
          </div>
          <p className="footer__brand-desc">
            Tecnologia assistiva de ponta para pessoas com deficiência visual.
            Inclusão digital que transforma vidas.
          </p>
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
          {[
            { icon: "♿", label: "WCAG 2.1 AA" },
            { icon: "🔒", label: "LGPD Compliance" },
            { icon: "🌐", label: "ISO 30071-1" },
          ].map(b => (
            <div key={b.label} className="footer__badge">
              <span>{b.icon}</span> {b.label}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════ */
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
        <FeatureSplit />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </SpeechCtx.Provider>
  );
}
