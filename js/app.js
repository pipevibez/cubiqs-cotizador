const RUTA_CATALOGO = "./data/servicios.json";

const estado = {
  categorias: [],
  servicios: [],
  categoriaActiva: null,
  carouselPosicion: 0,
  carouselInicio: 0,
  carouselPointerX: 0,
  carouselArrastrando: false,
  carouselSeMovio: false,
  carouselBloquearClickHasta: 0,
  cargando: false
};

const elementos = {
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  categorySection: document.querySelector("#category-section"),
  categoryGrid: document.querySelector("#category-grid"),
  categoryRail: document.querySelector("#category-rail"),
  btnRetry: document.querySelector("#btn-retry"),
  modalOverlay: document.querySelector("#modal-overlay"),
  serviceModal: document.querySelector("#service-modal"),
  serviceModalTitle: document.querySelector("#service-modal-title"),
  serviceModalDescription: document.querySelector("#service-modal-description"),
  serviceModalList: document.querySelector("#service-modal-list"),
  btnCloseServiceModal: document.querySelector("#btn-close-service-modal")
};

function escaparHTML(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(valor);
}

function validarCatalogo(datos) {
  const categoriasValidas = Array.isArray(datos?.categorias) && datos.categorias.length > 0;
  const serviciosValidos = Array.isArray(datos?.servicios) && datos.servicios.length > 0;

  if (!categoriasValidas || !serviciosValidos) {
    throw new Error("El catálogo recibido no tiene la estructura esperada.");
  }

  const estructuraValida = datos.servicios.every(
    ({ id, nombre, categoriaId, precio }) =>
      Number.isInteger(id) &&
      typeof nombre === "string" &&
      typeof categoriaId === "string" &&
      Number(precio) > 0
  );

  if (!estructuraValida) {
    throw new Error("Hay servicios con datos incompletos.");
  }
}

function obtenerIconoCategoria(icono) {
  const iconos = {
    web: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18M7 7h.01M10 7h.01"/></svg>`,
    sistemas: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>`,
    apps: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="3"/><path d="M10 5h4M11 18.5h2"/></svg>`,
    automatizacion: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h8a4 4 0 0 1 4 4v6M19 17l-2-2-2 2M19 7h-3M5 17h3"/><circle cx="5" cy="7" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="5" cy="17" r="2"/></svg>`,
    soporte: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-2a8 8 0 0 1 16 0v2M4 13a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2v1ZM20 13a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1ZM17 17c0 2-2 3-5 3"/></svg>`
  };

  return iconos[icono] || iconos.sistemas;
}

function renderizarCategorias() {
  elementos.categoryGrid.innerHTML = estado.categorias
    .map(({ id, nombre, descripcion, icono }, indice) => `
      <article
        class="category-stage"
        data-category-id="${id}"
        data-category-index="${indice}"
        role="listitem"
        aria-label="${escaparHTML(nombre)}"
      >
        <div class="category-card">
          <span class="category-icon">${obtenerIconoCategoria(icono)}</span>
          <div class="category-copy">
            <h2>${escaparHTML(nombre)}</h2>
            <p>${escaparHTML(descripcion)}</p>
          </div>
          <button
            class="category-explore"
            type="button"
            data-action="open-category"
            data-category-id="${id}"
          >
            Explorar
          </button>
        </div>
      </article>
    `)
    .join("");

  estado.carouselPosicion = 0;
  elementos.categoryRail.max = String(Math.max(0, estado.categorias.length - 1));
  elementos.categoryRail.value = "0";
  actualizarCarousel(false);
}

function normalizarPosicion(posicion) {
  const total = estado.categorias.length;
  return total ? ((posicion % total) + total) % total : 0;
}

function obtenerDiferenciaCircular(indice, posicion, total) {
  let diferencia = indice - normalizarPosicion(posicion);
  const mitad = total / 2;

  if (diferencia > mitad) {
    diferencia -= total;
  }

  if (diferencia < -mitad) {
    diferencia += total;
  }

  return diferencia;
}

function actualizarCarousel(animar = true) {
  const tarjetas = [...elementos.categoryGrid.querySelectorAll(".category-stage")];
  const total = tarjetas.length;

  if (!total) {
    return;
  }

  elementos.categoryGrid.classList.toggle("is-dragging", !animar);
  const ancho = elementos.categoryGrid.clientWidth || 900;
  const radioX = Math.min(455, Math.max(260, ancho * 0.39));

  tarjetas.forEach((tarjeta, indice) => {
    const diferencia = obtenerDiferenciaCircular(indice, estado.carouselPosicion, total);
    const angulo = diferencia * ((Math.PI * 2) / total);
    const coseno = Math.cos(angulo);
    const seno = Math.sin(angulo);
    const profundidad = (coseno - 1) * 185;
    const escala = 0.72 + ((coseno + 1) / 2) * 0.28;
    const opacidad = 0.78 + ((coseno + 1) / 2) * 0.22;
    const desplazamientoX = seno * radioX;
    const rotacion = -seno * 15;
    const activa = Math.abs(diferencia) < 0.42;

    tarjeta.style.setProperty("--carousel-x", `${desplazamientoX}px`);
    tarjeta.style.setProperty("--carousel-z", `${profundidad}px`);
    tarjeta.style.setProperty("--carousel-scale", escala.toFixed(3));
    tarjeta.style.setProperty("--carousel-rotate", `${rotacion.toFixed(2)}deg`);
    tarjeta.style.setProperty("--carousel-opacity", opacidad.toFixed(3));
    tarjeta.style.setProperty("--carousel-zindex", String(Math.round((coseno + 1) * 50)));
    tarjeta.classList.toggle("is-active", activa);
    tarjeta.setAttribute("aria-current", activa ? "true" : "false");
    tarjeta.tabIndex = activa ? 0 : -1;
  });

  if (!estado.carouselArrastrando) {
    elementos.categoryRail.value = String(normalizarPosicion(Math.round(estado.carouselPosicion)));
  }
}

function moverCarouselHacia(indice) {
  const total = estado.categorias.length;

  if (!total) {
    return;
  }

  const posicionActual = normalizarPosicion(estado.carouselPosicion);
  let diferencia = indice - posicionActual;
  const mitad = total / 2;

  if (diferencia > mitad) {
    diferencia -= total;
  }

  if (diferencia < -mitad) {
    diferencia += total;
  }

  estado.carouselPosicion += diferencia;
  actualizarCarousel(true);
}

function abrirCategoria(categoriaId) {
  const categoria = estado.categorias.find(({ id }) => id === categoriaId);

  if (!categoria) {
    return;
  }

  estado.categoriaActiva = categoriaId;
  elementos.serviceModalTitle.textContent = categoria.nombre;
  elementos.serviceModalDescription.textContent = categoria.descripcion;
  renderizarServiciosCategoria();

  elementos.modalOverlay.hidden = false;
  elementos.serviceModal.hidden = false;

  requestAnimationFrame(() => {
    elementos.modalOverlay.classList.add("is-open");
    elementos.serviceModal.classList.add("is-open");
    elementos.serviceModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    elementos.btnCloseServiceModal.focus();
  });
}

function renderizarServiciosCategoria() {
  const servicios = estado.servicios.filter(
    ({ categoriaId }) => categoriaId === estado.categoriaActiva
  );

  elementos.serviceModalList.innerHTML = servicios
    .map(({ nombre, descripcion, precio, modalidad, unidad }) => {
      const precioTexto = modalidad === "mensual" && unidad
        ? `${formatearMoneda(precio)} / ${unidad}`
        : `Desde ${formatearMoneda(precio)}`;

      return `
        <article class="service-card">
          <div>
            <h3>${escaparHTML(nombre)}</h3>
            <p>${escaparHTML(descripcion)}</p>
          </div>
          <div class="service-price">
            <span>${modalidad === "mensual" ? "Valor" : "Estimación base"}</span>
            <strong>${precioTexto}</strong>
          </div>
        </article>
      `;
    })
    .join("");
}

function cerrarModalServicios() {
  elementos.modalOverlay.classList.remove("is-open");
  elementos.serviceModal.classList.remove("is-open");
  elementos.serviceModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  estado.categoriaActiva = null;

  window.setTimeout(() => {
    elementos.modalOverlay.hidden = true;
    elementos.serviceModal.hidden = true;
  }, 220);
}

function iniciarArrastre(evento) {
  if (evento.button !== undefined && evento.button !== 0) {
    return;
  }

  if (evento.target.closest(".category-explore")) {
    return;
  }

  estado.carouselSeMovio = false;
  estado.carouselPointerX = evento.clientX;
  estado.carouselInicio = estado.carouselPosicion;
  estado.carouselArrastrando = true;
  elementos.categoryGrid.setPointerCapture?.(evento.pointerId);
}

function moverArrastre(evento) {
  if (!estado.carouselArrastrando) {
    return;
  }

  const desplazamiento = evento.clientX - estado.carouselPointerX;

  if (Math.abs(desplazamiento) > 6) {
    estado.carouselSeMovio = true;
  }

  estado.carouselPosicion = estado.carouselInicio - desplazamiento / 225;
  elementos.categoryRail.value = String(normalizarPosicion(estado.carouselPosicion));
  actualizarCarousel(false);
}

function terminarArrastre(evento) {
  if (!estado.carouselArrastrando) {
    return;
  }

  const desplazamiento = Math.abs(evento.clientX - estado.carouselPointerX);
  estado.carouselArrastrando = false;
  estado.carouselPosicion = Math.round(estado.carouselPosicion);

  if (desplazamiento > 7 || estado.carouselSeMovio) {
    estado.carouselBloquearClickHasta = Date.now() + 250;
  }

  elementos.categoryGrid.releasePointerCapture?.(evento.pointerId);
  actualizarCarousel(true);
}

function sincronizarDesdeRail() {
  estado.carouselArrastrando = true;
  estado.carouselPosicion = Number(elementos.categoryRail.value);
  actualizarCarousel(false);
}

function terminarRail() {
  estado.carouselArrastrando = false;
  estado.carouselPosicion = Math.round(Number(elementos.categoryRail.value));
  actualizarCarousel(true);
}

async function cargarCatalogo() {
  estado.cargando = true;
  elementos.loadingState.hidden = false;
  elementos.errorState.hidden = true;
  elementos.categorySection.hidden = true;

  try {
    const respuesta = await fetch(RUTA_CATALOGO);

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar el catálogo. Estado ${respuesta.status}.`);
    }

    const datos = await respuesta.json();
    validarCatalogo(datos);

    estado.categorias = datos.categorias;
    estado.servicios = datos.servicios;
    renderizarCategorias();
    elementos.categorySection.hidden = false;
  } catch (error) {
    elementos.errorState.hidden = false;
  } finally {
    estado.cargando = false;
    elementos.loadingState.hidden = true;
  }
}

elementos.categoryGrid.addEventListener("click", (evento) => {
  const botonExplorar = evento.target.closest("[data-action='open-category']");
  const tarjeta = evento.target.closest(".category-stage");

  if (!tarjeta) {
    return;
  }

  if (botonExplorar) {
    abrirCategoria(botonExplorar.dataset.categoryId);
    return;
  }

  if (Date.now() < estado.carouselBloquearClickHasta) {
    return;
  }

  if (!tarjeta.classList.contains("is-active")) {
    moverCarouselHacia(Number(tarjeta.dataset.categoryIndex));
    return;
  }

  abrirCategoria(tarjeta.dataset.categoryId);
});

elementos.categoryGrid.addEventListener("keydown", (evento) => {
  if (evento.key !== "Enter" && evento.key !== " ") {
    return;
  }

  const tarjeta = evento.target.closest(".category-stage.is-active");

  if (!tarjeta || evento.target.closest(".category-explore")) {
    return;
  }

  evento.preventDefault();
  abrirCategoria(tarjeta.dataset.categoryId);
});

elementos.categoryGrid.addEventListener("pointerdown", iniciarArrastre);
elementos.categoryGrid.addEventListener("pointermove", moverArrastre);
elementos.categoryGrid.addEventListener("pointerup", terminarArrastre);
elementos.categoryGrid.addEventListener("pointercancel", terminarArrastre);

elementos.categoryRail.addEventListener("input", sincronizarDesdeRail);
elementos.categoryRail.addEventListener("change", terminarRail);
elementos.categoryRail.addEventListener("pointerup", terminarRail);
elementos.btnRetry.addEventListener("click", cargarCatalogo);
elementos.btnCloseServiceModal.addEventListener("click", cerrarModalServicios);
elementos.modalOverlay.addEventListener("click", cerrarModalServicios);

window.addEventListener("resize", () => actualizarCarousel(false));

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && elementos.serviceModal.classList.contains("is-open")) {
    cerrarModalServicios();
  }
});

cargarCatalogo();
