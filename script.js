(() => {
  const FRASES = [
    "APIs REST resilientes",
    "microsserviços na AWS",
    "integrações com SQS e SNS",
    "dashboards em Power BI",
  ];
  
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Menu Mobile
  const btn = $(".menu-btn"), menu = $("#menu");
  const fecha = () => { 
    menu.classList.remove("aberto"); 
    btn.setAttribute("aria-expanded", "false"); 
  };
  btn.onclick = () => btn.setAttribute("aria-expanded", menu.classList.toggle("aberto"));
  $$("a", menu).forEach(a => a.addEventListener("click", fecha));

  // 2. Texto Digitando
  const el = $("#digitando");
  if (!reduz && el) {
    let f = 0, c = 0, apaga = false;
    (function tick() {
      const t = FRASES[f];
      c += apaga ? -1 : 1;
      el.textContent = t.slice(0, c);
      let d = apaga ? 35 : 70;
      if (!apaga && c === t.length) { apaga = true; d = 1600; }
      else if (apaga && c === 0) { apaga = false; f = (f + 1) % FRASES.length; d = 300; }
      setTimeout(tick, d);
    })();
  }

  // 3. Filtro de Projetos
  $$(".filtro").forEach(b => b.addEventListener("click", () => {
    $$(".filtro").forEach(x => x.classList.toggle("ativo", x === b));
    $$(".projeto").forEach(p => {
      p.hidden = b.dataset.filtro !== "todos" && p.dataset.tag !== b.dataset.filtro;
    });
  }));

  // 4. Brilho que segue o mouse nos cards
  $$(".projeto, .skills > div").forEach(c => c.addEventListener("pointermove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  // 5. Foto inclina com o mouse
  const palco = $(".palco"), foto = $("#foto");
  const inclina = (rx, ry) => { 
    foto.style.setProperty("--rx", rx + "deg"); 
    foto.style.setProperty("--ry", ry + "deg"); 
  };
  if (!reduz && palco && foto) {
    palco.addEventListener("pointermove", e => {
      const r = palco.getBoundingClientRect();
      inclina(-((e.clientY - r.top) / r.height - .5) * 18, ((e.clientX - r.left) / r.width - .5) * 18);
    });
    palco.addEventListener("pointerleave", () => inclina(0, 0));
  }

  // 6. Envio do Formulário (Protegido com "if" caso o HTML não tenha formulário)
  const formContato = $("#form-contato");
  if (formContato) {
    formContato.addEventListener("submit", async e => {
      e.preventDefault(); 
      const btnSubmit = $("button[type='submit']", formContato);
      const textoOriginal = btnSubmit.textContent;
      
      btnSubmit.textContent = "Enviando...";
      btnSubmit.disabled = true;

      try {
        const response = await fetch(formContato.action, {
          method: formContato.method,
          body: new FormData(formContato),
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          btnSubmit.textContent = "Mensagem enviada com sucesso!";
          formContato.reset();
        } else {
          btnSubmit.textContent = "Erro ao enviar. Tente novamente.";
        }
      } catch (error) {
        btnSubmit.textContent = "Erro de conexão.";
      } finally {
        setTimeout(() => {
          btnSubmit.textContent = textoOriginal;
          btnSubmit.disabled = false;
        }, 3000);
      }
    });
  }

  // 7. Rede de nós (microsserviços) no fundo, reage ao mouse
  const cv = document.querySelector("#rede");
  if (cv) {
    const cx = cv.getContext("2d");
    let W, H, pts = [], isVisible = true;
    const m = { x: -999, y: -999 };
    
    const linha = (a, b, alfa) => {
      cx.strokeStyle = `rgba(139,147,255,${alfa})`;
      cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
    };
    
    function desenha() {
      if (!isVisible) return; 
      
      cx.clearRect(0, 0, W, H);
      for (const p of pts) {
        if (!reduz) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        cx.fillStyle = "rgba(139,147,255,.55)";
        cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 6.3); cx.fill();
      }
      
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(a.x - pts[j].x, a.y - pts[j].y);
          if (d < 130) linha(a, pts[j], .16 * (1 - d / 130));
        }
        const dm = Math.hypot(a.x - m.x, a.y - m.y);
        if (dm < 180) linha(a, m, .5 * (1 - dm / 180));
      }
      
      if (!reduz) requestAnimationFrame(desenha);
    }
    
    function ajusta() {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      const n = Math.min(70, Math.floor(W * H / 18000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      }));
      if (reduz || !isVisible) desenha(); 
    }
    
    addEventListener("resize", ajusta);
    addEventListener("pointermove", e => { m.x = e.clientX; m.y = e.clientY; });
    
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !reduz) {
        desenha(); 
      }
    });
    observer.observe(cv);
    
    ajusta();
  }
})();