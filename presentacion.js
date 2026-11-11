(() => {
    const slides = Array.from(document.querySelectorAll(".slide"));
    const totalSlides = slides.length;

    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const btnAgenda = document.getElementById("btnAgenda");
    const btnOverview = document.getElementById("btnOverview");
    const btnCloseOverview = document.getElementById("btnCloseOverview");
    const btnFullscreen = document.getElementById("btnFullscreen");
    const btnRestart = document.getElementById("btnRestart");

    const progressFill = document.getElementById("progressFill");
    const slideCounter = document.getElementById("slideCounter");
    const overviewOverlay = document.getElementById("overviewOverlay");
    const overviewGrid = document.getElementById("overviewGrid");

    let currentIndex = 0;

    function formatIndex(idx) {
        return String(idx + 1).padStart(2, "0") + " / " + String(totalSlides).padStart(2, "0");
    }

    function buildOverview() {
        overviewGrid.innerHTML = "";
        slides.forEach((slide, idx) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "overview-card" + (idx === currentIndex ? " is-current" : "");
            card.dataset.index = String(idx);

            const num = document.createElement("span");
            num.className = "overview-num";
            num.textContent = "Diapositiva " + String(idx + 1).padStart(2, "0");

            const title = document.createElement("span");
            title.className = "overview-name";
            title.textContent = slide.dataset.title || "Diapositiva " + (idx + 1);

            card.append(num, title);
            card.addEventListener("click", () => {
                goToSlide(idx);
                closeOverview();
            });
            overviewGrid.appendChild(card);
        });
    }

    function updateOverviewSelection() {
        const cards = overviewGrid.querySelectorAll(".overview-card");
        cards.forEach((card, idx) => {
            card.classList.toggle("is-current", idx === currentIndex);
        });
    }

    function goToSlide(index, updateHash = true) {
        const clamped = Math.max(0, Math.min(totalSlides - 1, index));
        slides[currentIndex].classList.remove("is-active");
        currentIndex = clamped;
        slides[currentIndex].classList.add("is-active");
        slides[currentIndex].scrollTop = 0;

        slideCounter.textContent = formatIndex(currentIndex);
        progressFill.style.width = ((currentIndex + 1) / totalSlides) * 100 + "%";

        btnPrev.disabled = currentIndex === 0;
        btnNext.disabled = currentIndex === totalSlides - 1;
        updateOverviewSelection();

        if (updateHash) {
            history.replaceState(null, "", "#diapositiva-" + (currentIndex + 1));
        }
    }

    function openOverview() {
        overviewOverlay.hidden = false;
        btnOverview.setAttribute("aria-expanded", "true");
        const activeCard = overviewGrid.querySelector(".overview-card.is-current");
        if (activeCard) activeCard.focus();
    }

    function closeOverview() {
        overviewOverlay.hidden = true;
        btnOverview.setAttribute("aria-expanded", "false");
        btnOverview.focus();
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch {
            // Entornos que restringen pantalla completa
        }
    }

    document.addEventListener("fullscreenchange", () => {
        const active = Boolean(document.fullscreenElement);
        btnFullscreen.setAttribute("aria-pressed", String(active));
        btnFullscreen.textContent = active ? "Salir pantalla (F)" : "Pantalla completa (F)";
    });

    btnPrev.addEventListener("click", () => goToSlide(currentIndex - 1));
    btnNext.addEventListener("click", () => goToSlide(currentIndex + 1));
    btnAgenda.addEventListener("click", () => goToSlide(1));
    btnOverview.addEventListener("click", () => {
        if (overviewOverlay.hidden) openOverview();
        else closeOverview();
    });
    btnCloseOverview.addEventListener("click", closeOverview);
    if (btnRestart) {
        btnRestart.addEventListener("click", () => goToSlide(0));
    }
    btnFullscreen.addEventListener("click", toggleFullscreen);

    // Enlaces del índice interactivo (Diapositiva 2)
    document.querySelectorAll(".agenda-btn[data-goto]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = Number(btn.dataset.goto);
            if (!Number.isNaN(target)) goToSlide(target);
        });
    });

    // Atajos de teclado seguros (no interfieren con inputs o botones enfocados)
    document.addEventListener("keydown", (e) => {
        const target = e.target;
        const isTyping = target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement ||
            (target instanceof HTMLElement && target.isContentEditable);

        if (e.key === "Escape" && !overviewOverlay.hidden) {
            closeOverview();
            return;
        }

        if (isTyping) return;

        const isInteractiveEl = target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement;

        if (e.key === "ArrowRight" || e.key === "PageDown") {
            e.preventDefault();
            goToSlide(currentIndex + 1);
        } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
            e.preventDefault();
            goToSlide(currentIndex - 1);
        } else if (e.key === " " && !isInteractiveEl) {
            e.preventDefault();
            goToSlide(currentIndex + 1);
        } else if (e.key === "Home") {
            e.preventDefault();
            goToSlide(0);
        } else if (e.key === "End") {
            e.preventDefault();
            goToSlide(totalSlides - 1);
        } else if (e.key === "g" || e.key === "G") {
            if (overviewOverlay.hidden) openOverview();
            else closeOverview();
        } else if (e.key === "f" || e.key === "F") {
            toggleFullscreen();
        } else if (e.key === "2") {
            goToSlide(1);
        }
    });

    // Diapositiva 4: Inspector Cliente-Servidor
    const archDetails = {
        html: '<strong>HTML — Estructura y Semántica en el Cliente:</strong> Define el esqueleto del contenido (<code class="inline-code">&lt;main&gt;</code>, <code class="inline-code">&lt;section&gt;</code>, <code class="inline-code">&lt;button&gt;</code>, formularios y listas).',
        css: '<strong>CSS — Presentación y Diseño en el Cliente:</strong> Controla la capa visual: variables de color, tipografías, alineaciones Flexbox/Grid y adaptabilidad a cada pantalla.',
        js: '<strong>JavaScript — Interactividad y Lógica en el Cliente:</strong> Corre dentro del navegador del usuario; escucha eventos de ratón y teclado, valida datos antes de enviarlos y actualiza el DOM sin recargas.',
        php: '<strong>PHP — Procesamiento Clásico en el Servidor:</strong> Se ejecuta exclusivamente en el servidor (ej. Apache). Su código nunca viaja al navegador: conecta con bases de datos SQL, resguarda credenciales y devuelve el HTML resultante.'
    };
    const archInspector = document.getElementById("archInspector");
    const archButtons = document.querySelectorAll(".arch-btn[data-layer]");
    archButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            archButtons.forEach((b) => b.classList.remove("is-selected"));
            btn.classList.add("is-selected");
            archInspector.innerHTML = archDetails[btn.dataset.layer] || "";
        });
    });

    // Diapositiva 6: Mecanismos de integración HTML
    const integData = {
        inline: {
            code: '&lt;<span class="tok-kw">button</span> onclick=<span class="tok-str">"alert(\'Hola\')"</span>&gt;\n  Mostrar aviso\n&lt;/<span class="tok-kw">button</span>&gt;',
            title: 'JavaScript en línea (Inline) <span class="badge-error">Desaconsejado</span>',
            body: '<p>Incrusta instrucciones directamente dentro de atributos HTML como <code class="inline-code">onclick</code>.</p><p><strong>Limitación:</strong> mezcla el marcado estructural con la lógica de programación, dificultando su mantenimiento.</p>'
        },
        interno: {
            code: '&lt;<span class="tok-kw">body</span>&gt;\n  &lt;<span class="tok-kw">main</span>&gt;...&lt;/<span class="tok-kw">main</span>&gt;\n  &lt;<span class="tok-kw">script</span>&gt;\n    <span class="tok-kw">const</span> btn = document.getElementById(<span class="tok-str">"btnMenu"</span>);\n  &lt;/<span class="tok-kw">script</span>&gt;\n&lt;/<span class="tok-kw">body</span>&gt;',
            title: 'JavaScript interno (&lt;script&gt;) <span class="badge-info">Demos autocontenidas</span>',
            body: '<p>Se coloca en un bloque <code class="inline-code">&lt;script&gt;</code> dentro del mismo archivo <code class="inline-code">.html</code>, justo antes de <code class="inline-code">&lt;/body&gt;</code>.</p><p><strong>Ventaja:</strong> garantiza que el navegador arme primero los elementos visuales antes de buscarlos en memoria, ideal para ejemplos como <code class="inline-code">index.html</code>.</p>'
        },
        externo: {
            code: '&lt;<span class="tok-kw">head</span>&gt;\n  &lt;<span class="tok-kw">script</span> src=<span class="tok-str">"presentacion.js"</span> <span class="tok-kw">defer</span>&gt;&lt;/<span class="tok-kw">script</span>&gt;\n&lt;/<span class="tok-kw">head</span>&gt;',
            title: 'JavaScript externo (.js + defer) <span class="badge-ok">Estándar profesional</span>',
            body: '<p>Separa toda la lógica en archivos <code class="inline-code">.js</code> independientes vinculados desde <code class="inline-code">&lt;head&gt;</code>.</p><p><strong>Rol de <code class="inline-code">defer</code>:</strong> descarga el archivo en segundo plano sin frenar el render visual y ejecuta el código cuando el HTML está completo.</p>'
        }
    };
    const integTabs = document.querySelectorAll(".pill-tab[data-integ]");
    const integCode = document.getElementById("integCode");
    const integInfo = document.getElementById("integInfo");
    integTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const item = integData[tab.dataset.integ];
            if (!item) return;
            integTabs.forEach((t) => {
                t.classList.remove("is-active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("is-active");
            tab.setAttribute("aria-selected", "true");
            integCode.innerHTML = item.code;
            integInfo.innerHTML = "<h3>" + item.title + "</h3>" + item.body;
        });
    });

    // Diapositiva 7: Explorador DOM
    const domData = {
        document: {
            title: 'Nodo seleccionado: <code class="inline-code">document</code>',
            desc: 'Objeto raíz del DOM en memoria RAM; punto de comunicación dinámica entre JavaScript y la página.',
            code: '<span class="tok-cm">// Localizar un elemento sin recargar</span>\n<span class="tok-kw">const</span> boton = document.getElementById(<span class="tok-str">"btnMenu"</span>);',
            extra: 'Permite leer valores escritos, inyectar textos, alternar clases CSS y actualizar atributos ARIA al instante.'
        },
        main: {
            title: 'Nodo seleccionado: <code class="inline-code">&lt;main&gt;</code>',
            desc: 'Contenedor principal convertido en objeto dentro del árbol jerárquico.',
            code: '<span class="tok-kw">const</span> main = document.querySelector(<span class="tok-str">"main"</span>);\nmain.children.length; <span class="tok-cm">// 4 secciones</span>',
            extra: 'Agrupa los cuatro módulos demostrativos del caso práctico.'
        },
        section: {
            title: 'Nodo seleccionado: <code class="inline-code">&lt;section class="bloque"&gt;</code>',
            desc: 'Nodo padre de cada módulo que organiza título, botón, entrada y mensaje de estado.',
            code: '<span class="tok-kw">const</span> bloques = document.querySelectorAll(<span class="tok-str">".bloque"</span>);',
            extra: 'Cada sección encapsula un pilar técnico independiente de JavaScript.'
        },
        btnMenu: {
            title: 'Nodo seleccionado: <code class="inline-code">&lt;button id="btnMenu"&gt;</code>',
            desc: 'Elemento interactivo localizado por identificador único para escuchar clics.',
            code: 'btnMenu.setAttribute(<span class="tok-str">"aria-expanded"</span>, String(!oculto));',
            extra: 'Mantiene informados a los lectores de pantalla sobre si el menú está desplegado o cerrado.'
        },
        listaMenu: {
            title: 'Nodo seleccionado: <code class="inline-code">&lt;ul id="listaMenu"&gt;</code>',
            desc: 'Lista cuya visibilidad cambia alternando la clase CSS <code class="inline-code">.oculto</code>.',
            code: 'listaMenu.classList.toggle(<span class="tok-str">"oculto"</span>);',
            extra: 'Al retirar la clase, aparece en pantalla inmediatamente sin petición al servidor.'
        },
        inputNombre: {
            title: 'Nodo seleccionado: <code class="inline-code">&lt;input id="inputNombre"&gt;</code>',
            desc: 'Campo de texto cuyo contenido escrito en vivo se lee mediante <code class="inline-code">.value</code>.',
            code: '<span class="tok-kw">const</span> nombre = inputNombre.value.trim();',
            extra: 'Con <code class="inline-code">trim()</code> evitamos entradas válidas compuestas solo por espacios.'
        }
    };
    const domNodes = document.querySelectorAll(".dom-node[data-dom]");
    const domInspector = document.getElementById("domInspector");
    domNodes.forEach((node) => {
        node.addEventListener("click", () => {
            const info = domData[node.dataset.dom];
            if (!info) return;
            domNodes.forEach((n) => n.classList.remove("is-selected"));
            node.classList.add("is-selected");
            domInspector.innerHTML =
                "<h3>" + info.title + "</h3>" +
                "<p>" + info.desc + "</p>" +
                '<pre class="code-block code-spaced">' + info.code + "</pre>" +
                '<p class="mt-md">' + info.extra + "</p>";
        });
    });

    // Diapositiva 8: Simulador var / let / const (Idea 1) y Scope Chain clicable (Idea 2)
    const declCases = {
        var: {
            kw: "var",
            insideClass: "scope-result-pill is-warn",
            insideHtml: "<strong>Dentro del bloque:</strong>Permite reasignar a 300 (y redeclarar).",
            outsideClass: "scope-result-pill is-error",
            outsideHtml: '<strong>Fuera del <code class="inline-code">if</code>:</strong>¡Fuga! Imprime 300 afuera.'
        },
        let: {
            kw: "let",
            insideClass: "scope-result-pill is-ok",
            insideHtml: "<strong>Dentro del bloque:</strong>Ahora vale 300 (reasignable).",
            outsideClass: "scope-result-pill is-ok",
            outsideHtml: '<strong>Fuera del <code class="inline-code">if</code>:</strong>Protegida (ReferenceError).'
        },
        const: {
            kw: "const",
            insideClass: "scope-result-pill is-error",
            insideHtml: "<strong>Dentro del bloque:</strong>TypeError: no permite reasignar.",
            outsideClass: "scope-result-pill is-ok",
            outsideHtml: '<strong>Fuera del <code class="inline-code">if</code>:</strong>Protegida (ReferenceError).'
        }
    };
    const declTabs = document.querySelectorAll(".pill-tab[data-decl]");
    const scopeSimCode = document.getElementById("scopeSimCode");
    const scopeResInside = document.getElementById("scopeResInside");
    const scopeResOutside = document.getElementById("scopeResOutside");

    declTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const cfg = declCases[tab.dataset.decl];
            if (!cfg) return;
            declTabs.forEach((t) => {
                t.classList.remove("is-active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("is-active");
            tab.setAttribute("aria-selected", "true");

            scopeSimCode.innerHTML =
                '<span class="tok-kw">if</span> (<span class="tok-kw">true</span>) {\n' +
                '  <span class="tok-kw">' + cfg.kw + '</span> saldo = <span class="tok-num">500</span>;\n' +
                '  saldo = <span class="tok-num">300</span>; <span class="tok-cm">// Reasignación dentro</span>\n' +
                '}\n' +
                'console.log(saldo); <span class="tok-cm">// Lectura fuera del if</span>';

            scopeResInside.className = cfg.insideClass;
            scopeResInside.innerHTML = cfg.insideHtml;
            scopeResOutside.className = cfg.outsideClass;
            scopeResOutside.innerHTML = cfg.outsideHtml;
        });
    });

    const scopeBoxGlobal = document.getElementById("scopeBoxGlobal");
    const scopeBoxFn = document.getElementById("scopeBoxFn");
    const scopeBoxBlock = document.getElementById("scopeBoxBlock");
    const scopeStatusGlobal = document.getElementById("scopeStatusGlobal");
    const scopeStatusFn = document.getElementById("scopeStatusFn");
    const scopeStatusBlock = document.getElementById("scopeStatusBlock");
    const scopeChainSummary = document.getElementById("scopeChainSummary");
    const scopeTriggers = document.querySelectorAll(".scope-trigger[data-scope]");

    function setBoxState(box, statusEl, state, label) {
        box.classList.remove("is-origin", "is-visible", "is-blocked");
        box.classList.add("is-" + state);
        statusEl.textContent = label;
    }

    const scopeChainConfigs = {
        block: {
            global: ["visible", "Visible"],
            fn: ["visible", "Visible"],
            block: ["origin", "Leyendo aquí"],
            summary: '<strong>Desde el Bloque { }:</strong> la cadena sube y accede a los 3 niveles (<code class="inline-code">oculto</code>, <code class="inline-code">tipo</code> y <code class="inline-code">contador</code>).'
        },
        fn: {
            global: ["visible", "Visible"],
            fn: ["origin", "Leyendo aquí"],
            block: ["blocked", "Bloqueado"],
            summary: '<strong>Desde la Función:</strong> lee sus parámetros y el ámbito global, pero no puede entrar al bloque <code class="inline-code">{ }</code> interno.'
        },
        global: {
            global: ["origin", "Leyendo aquí"],
            fn: ["blocked", "Bloqueado"],
            block: ["blocked", "Bloqueado"],
            summary: '<strong>Desde Global:</strong> solo ve <code class="inline-code">contador</code>; jamás accede a las variables que viven dentro de funciones o bloques.'
        }
    };

    scopeTriggers.forEach((btn) => {
        btn.addEventListener("click", () => {
            const cfg = scopeChainConfigs[btn.dataset.scope];
            if (!cfg) return;
            setBoxState(scopeBoxGlobal, scopeStatusGlobal, cfg.global[0], cfg.global[1]);
            setBoxState(scopeBoxFn, scopeStatusFn, cfg.fn[0], cfg.fn[1]);
            setBoxState(scopeBoxBlock, scopeStatusBlock, cfg.block[0], cfg.block[1]);
            scopeChainSummary.innerHTML = cfg.summary;
        });
    });

    // Diapositiva 9: Filtro de palabras reservadas
    const kwTabs = document.querySelectorAll(".pill-tab[data-kwcat]");
    const kwCards = document.querySelectorAll("#kwGrid .kw-card");
    kwTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const cat = tab.dataset.kwcat;
            kwTabs.forEach((t) => t.classList.remove("is-active"));
            tab.classList.add("is-active");
            kwCards.forEach((card) => {
                const match = cat === "todas" || card.dataset.cat === cat;
                card.classList.toggle("is-hidden", !match);
            });
        });
    });

    // Diapositiva 11: Simulador Síncrono vs Asíncrono
    const simPulse = document.getElementById("simPulse");
    const btnSimSync = document.getElementById("btnSimSync");
    const btnSimAsync = document.getElementById("btnSimAsync");
    const simStatus = document.getElementById("simStatus");
    const pPending = document.getElementById("pPending");
    const pFulfilled = document.getElementById("pFulfilled");
    const pRejected = document.getElementById("pRejected");

    let pulsePos = 0;
    let pulseDir = 1;
    let pulseFrozen = false;
    let simTimer = null;

    setInterval(() => {
        if (pulseFrozen || currentIndex !== 10) return;
        pulsePos += pulseDir * 4;
        if (pulsePos >= 240) pulseDir = -1;
        if (pulsePos <= 0) pulseDir = 1;
        simPulse.style.transform = "translateX(" + pulsePos + "%)";
    }, 45);

    function setPromiseState(state) {
        [pPending, pFulfilled, pRejected].forEach((el) => el.classList.remove("is-highlighted"));
        if (state === "pending") pPending.classList.add("is-highlighted");
        if (state === "fulfilled") pFulfilled.classList.add("is-highlighted");
        if (state === "rejected") pRejected.classList.add("is-highlighted");
    }

    btnSimSync.addEventListener("click", () => {
        if (simTimer) clearTimeout(simTimer);
        pulseFrozen = true;
        btnSimSync.disabled = true;
        btnSimAsync.disabled = true;
        setPromiseState("rejected");
        simStatus.dataset.tipo = "error";
        simStatus.textContent = "Hilo principal bloqueado durante 1,5 s (la interfaz queda congelada).";
        simTimer = setTimeout(() => {
            pulseFrozen = false;
            btnSimSync.disabled = false;
            btnSimAsync.disabled = false;
            simStatus.dataset.tipo = "ok";
            simStatus.textContent = "Tarea síncrona finalizada; el hilo volvió a responder.";
        }, 1500);
    });

    btnSimAsync.addEventListener("click", async () => {
        if (simTimer) clearTimeout(simTimer);
        pulseFrozen = false;
        btnSimSync.disabled = true;
        btnSimAsync.disabled = true;
        setPromiseState("pending");
        simStatus.dataset.tipo = "info";
        simStatus.textContent = "Promesa Pendiente: await libera el hilo y la interfaz sigue fluida...";
        await new Promise((resolve) => {
            simTimer = setTimeout(resolve, 1500);
        });
        setPromiseState("fulfilled");
        simStatus.dataset.tipo = "ok";
        simStatus.textContent = "Promesa Cumplida: la función retoma exactamente tras el await.";
        btnSimSync.disabled = false;
        btnSimAsync.disabled = false;
    });

    // Diapositiva 13 — Bloque 1: Menú desplegable
    const demoBtnMenu = document.getElementById("demoBtnMenu");
    const demoListaMenu = document.getElementById("demoListaMenu");
    const demoMenuState = document.getElementById("demoMenuState");

    demoBtnMenu.addEventListener("click", () => {
        const oculto = demoListaMenu.classList.toggle("oculto");
        demoBtnMenu.setAttribute("aria-expanded", String(!oculto));
        demoMenuState.textContent =
            'classList: "' + (oculto ? "oculto" : "(visible)") + '" · aria-expanded="' + String(!oculto) + '"';
    });

    // Diapositiva 13 — Bloque 2: Contador de clics
    let contador = 0;
    const demoBtnContador = document.getElementById("demoBtnContador");
    const demoTextoContador = document.getElementById("demoTextoContador");
    const demoContadorState = document.getElementById("demoContadorState");

    demoBtnContador.addEventListener("click", () => {
        contador++;
        demoTextoContador.textContent = contador;
        demoContadorState.textContent = "let contador = " + contador + " (conservado en Scope externo)";
    });

    // Diapositiva 14 — Bloque 3: Saludo y Enter
    const demoInputNombre = document.getElementById("demoInputNombre");
    const demoBtnSaludar = document.getElementById("demoBtnSaludar");
    const demoTextoSaludo = document.getElementById("demoTextoSaludo");
    const demoSaludoState = document.getElementById("demoSaludoState");

    function mostrarSaludo(tipo, mensaje) {
        demoTextoSaludo.dataset.tipo = tipo;
        demoTextoSaludo.textContent = mensaje;
        demoSaludoState.textContent = 'data-tipo="' + tipo + '"';
    }

    demoBtnSaludar.addEventListener("click", () => {
        const nombre = demoInputNombre.value.trim();
        if (nombre === "") {
            mostrarSaludo("error", "Por favor, ingresa un nombre antes de continuar.");
        } else {
            mostrarSaludo("ok", "Hola, " + nombre + ". El evento del botón se ejecutó correctamente.");
        }
    });

    demoInputNombre.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            demoBtnSaludar.click();
        }
    });

    // Diapositiva 15 — Bloque 4: Pago Móvil asíncrono
    let saldoDisponible = 500;
    const demoTextoSaldo = document.getElementById("demoTextoSaldo");
    const demoInputMonto = document.getElementById("demoInputMonto");
    const demoBtnTransferir = document.getElementById("demoBtnTransferir");
    const demoBtnResetSaldo = document.getElementById("demoBtnResetSaldo");
    const demoTextoEstado = document.getElementById("demoTextoEstado");
    const stepSync = document.getElementById("stepSync");
    const stepAsync = document.getElementById("stepAsync");
    const stepDone = document.getElementById("stepDone");

    function resetSteps() {
        [stepSync, stepAsync, stepDone].forEach((el) => {
            el.classList.remove("is-current", "is-done", "is-fail");
        });
    }

    function mostrarEstado(tipo, mensaje) {
        demoTextoEstado.dataset.tipo = tipo;
        demoTextoEstado.textContent = mensaje;
    }

    demoBtnTransferir.addEventListener("click", async () => {
        resetSteps();
        const monto = Number(demoInputMonto.value);

        if (monto <= 0 || Number.isNaN(monto)) {
            stepSync.classList.add("is-fail");
            mostrarEstado("error", "Error: Ingresa un monto numérico válido mayor a cero.");
            return;
        }

        if (monto > saldoDisponible) {
            stepSync.classList.add("is-fail");
            mostrarEstado("error", "Error: Fondos insuficientes para realizar la operación.");
            return;
        }

        stepSync.classList.add("is-done");
        stepAsync.classList.add("is-current");
        demoBtnTransferir.disabled = true;
        demoBtnResetSaldo.disabled = true;
        demoBtnTransferir.setAttribute("aria-busy", "true");
        mostrarEstado("info", "Procesando transacción con el banco...");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        saldoDisponible = saldoDisponible - monto;
        demoTextoSaldo.textContent = saldoDisponible;
        mostrarEstado("ok", "Transacción aprobada. Se descontaron $" + monto + " de su cuenta.");
        demoInputMonto.value = "";
        stepAsync.classList.remove("is-current");
        stepAsync.classList.add("is-done");
        stepDone.classList.add("is-done");
        demoBtnTransferir.disabled = false;
        demoBtnResetSaldo.disabled = false;
        demoBtnTransferir.removeAttribute("aria-busy");
    });

    demoInputMonto.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            demoBtnTransferir.click();
        }
    });

    demoBtnResetSaldo.addEventListener("click", () => {
        saldoDisponible = 500;
        demoTextoSaldo.textContent = saldoDisponible;
        demoInputMonto.value = "";
        demoTextoEstado.textContent = "";
        delete demoTextoEstado.dataset.tipo;
        resetSteps();
    });


    buildOverview();
    const match = window.location.hash.match(/^#diapositiva-(\d+)$/);
    const initialSlide = match ? Number(match[1]) - 1 : 0;
    goToSlide(Number.isNaN(initialSlide) ? 0 : initialSlide, false);
})();
