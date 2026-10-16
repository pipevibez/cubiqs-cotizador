const RUTA_CATALOGO = "./data/servicios.json";
const NUMERO_WHATSAPP = "5493812091755";

const estado = {
  categorias: [],
  servicios: [],
  cotizacion: crearBorradorVacio(),
  ultimaCotizacion: null,
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
  catalogView: document.querySelector("#catalog-view"),
  reviewView: document.querySelector("#review-view"),
  successView: document.querySelector("#success-view"),
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  categorySection: document.querySelector("#category-section"),
  categoryGrid: document.querySelector("#category-grid"),
  categorySkeletons: document.querySelector("#category-skeletons"),
  categoryRail: document.querySelector("#category-rail"),
  btnRetry: document.querySelector("#btn-retry"),
  btnHeaderQuote: document.querySelector("#btn-header-cotizacion"),
  headerQuoteCount: document.querySelector("#header-quote-count"),
  btnLastQuote: document.querySelector("#btn-ultima-cotizacion"),
  quoteFab: document.querySelector("#quote-fab"),
  fabCount: document.querySelector("#fab-count"),
  fabTotal: document.querySelector("#fab-total"),
  overlay: document.querySelector("#overlay"),
  serviceModal: document.querySelector("#service-modal"),
  serviceModalTitle: document.querySelector("#service-modal-title"),
  serviceModalDescription: document.querySelector("#service-modal-description"),
  serviceModalList: document.querySelector("#service-modal-list"),
  btnCloseServiceModal: document.querySelector("#btn-close-service-modal"),
  quoteDrawer: document.querySelector("#quote-drawer"),
  drawerCount: document.querySelector("#drawer-count"),
  quoteEmpty: document.querySelector("#quote-empty"),
  quoteItems: document.querySelector("#quote-items"),
  quoteFooter: document.querySelector("#quote-footer"),
  drawerTotal: document.querySelector("#drawer-total"),
  btnCloseDrawer: document.querySelector("#btn-close-drawer"),
  btnReviewQuote: document.querySelector("#btn-review-quote"),
  btnClearQuote: document.querySelector("#btn-clear-quote"),
  btnBackCatalog: document.querySelector("#btn-back-catalog"),
  reviewItems: document.querySelector("#review-items"),
  reviewItemCount: document.querySelector("#review-item-count"),
  reviewTotal: document.querySelector("#review-total"),
  clientForm: document.querySelector("#client-form"),
  clientName: document.querySelector("#client-name"),
  clientCompany: document.querySelector("#client-company"),
  clientEmail: document.querySelector("#client-email"),
  clientTimeline: document.querySelector("#client-timeline"),
  timelineSelect: document.querySelector("#timeline-select"),
  timelineSelectTrigger: document.querySelector("#timeline-select-trigger"),
  timelineSelectValue: document.querySelector("#timeline-select-value"),
  timelineSelectMenu: document.querySelector("#timeline-select-menu"),
  clientObjective: document.querySelector("#client-objective"),
  objectiveCount: document.querySelector("#objective-count"),
  autosaveIndicator: document.querySelector("#autosave-indicator"),
  finalQuoteId: document.querySelector("#final-quote-id"),
  finalQuoteDate: document.querySelector("#final-quote-date"),
  finalClientSummary: document.querySelector("#final-client-summary"),
  finalServices: document.querySelector("#final-services"),
  finalTotal: document.querySelector("#final-total"),
  btnWhatsapp: document.querySelector("#btn-whatsapp"),
  btnCopySummary: document.querySelector("#btn-copy-summary"),
  btnNewQuote: document.querySelector("#btn-new-quote")
};

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-start",
  showConfirmButton: false,
  timer: 2300,
  timerProgressBar: true,
  customClass: {
    popup: "cubiqs-toast"
  }
});

function crearBorradorVacio() {
  return {
    items: [],
    cliente: {
      nombre: "",
      empresa: "",
      email: "",
      plazo: "Sin fecha definida",
      objetivo: ""
    },
    actualizadoEn: new Date().toISOString()
  };
}

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

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(fecha));
}

function pluralUnidad(unidad, cantidad) {
  if (!unidad || cantidad === 1) {
    return unidad || "unidad";
  }

  return unidad === "mes" ? "meses" : `${unidad}s`;
}

function mostrarToast(mensaje, simbolo = "✓") {
  Toast.fire({
    html: `
      <div class="toast-message">
        <span class="toast-symbol" aria-hidden="true">${escaparHTML(simbolo)}</span>
        <span>${escaparHTML(mensaje)}</span>
      </div>
    `
  });
}

function clasesSweetAlert() {
  return {
    popup: "cubiqs-swal",
    title: "cubiqs-swal-title",
    htmlContainer: "cubiqs-swal-text",
    confirmButton: "cubiqs-swal-confirm",
    cancelButton: "cubiqs-swal-cancel",
    actions: "cubiqs-swal-actions"
  };
}

function configuracionSweetAlert() {
  return {
    buttonsStyling: false,
    customClass: clasesSweetAlert(),
    showClass: {
      popup: "swal2-show"
    },
    hideClass: {
      popup: "swal2-hide"
    }
  };
}

function renderizarSkeletons() {
  elementos.categorySkeletons.innerHTML = "";
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

async function cargarCatalogo() {
  estado.cargando = true;
  elementos.loadingState.hidden = false;
  elementos.errorState.hidden = true;
  elementos.categorySection.hidden = true;
  let cargaCorrecta = false;

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
    cargaCorrecta = true;
  } catch (error) {
    elementos.errorState.hidden = false;
  } finally {
    estado.cargando = false;
    elementos.loadingState.hidden = true;
  }

  if (cargaCorrecta) {
    await hidratarEstadoPersistido();
    requestAnimationFrame(() => actualizarCarouselCategorias(false));
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
        <div class="category-card-shell">
          <div class="category-card-content">
            <span class="category-icon">${obtenerIconoCategoria(icono)}</span>
            <div class="category-copy">
              <strong>${escaparHTML(nombre)}</strong>
              <span>${escaparHTML(descripcion)}</span>
            </div>
            <button
              class="category-explore-button"
              type="button"
              data-action="open-category"
              data-category-id="${id}"
              aria-label="Explorar servicios de ${escaparHTML(nombre)}"
            >
              <span>Explorar</span>
              <span class="category-explore-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>
              </span>
            </button>
          </div>
        </div>
      </article>
    `)
    .join("");

  estado.carouselPosicion = 0;
  elementos.categoryRail.min = "0";
  elementos.categoryRail.max = String(Math.max(0, estado.categorias.length - 1));
  elementos.categoryRail.step = "0.01";
  elementos.categoryRail.value = "0";
  actualizarCarouselCategorias(false);
}

function normalizarPosicionCarousel(posicion) {
  const total = estado.categorias.length;
  return total ? ((posicion % total) + total) % total : 0;
}

function diferenciaCircular(indice, posicion, total) {
  let diferencia = indice - normalizarPosicionCarousel(posicion);
  const mitad = total / 2;

  if (diferencia > mitad) {
    diferencia -= total;
  }

  if (diferencia < -mitad) {
    diferencia += total;
  }

  return diferencia;
}

function actualizarCarouselCategorias(animar = true) {
  const tarjetas = [...elementos.categoryGrid.querySelectorAll(".category-stage")];
  const total = tarjetas.length;

  if (!total) {
    return;
  }

  elementos.categoryGrid.classList.toggle("is-dragging", !animar);
  const ancho = elementos.categoryGrid.clientWidth || 900;
  const radioX = Math.min(455, Math.max(260, ancho * 0.39));

  tarjetas.forEach((tarjeta, indice) => {
    const diferencia = diferenciaCircular(indice, estado.carouselPosicion, total);
    const angulo = diferencia * ((Math.PI * 2) / total);
    const coseno = Math.cos(angulo);
    const seno = Math.sin(angulo);
    const profundidad = (coseno - 1) * 185;
    const escala = 0.72 + ((coseno + 1) / 2) * 0.28;
    const opacidad = 0.78 + ((coseno + 1) / 2) * 0.22;
    const desplazamientoX = seno * radioX;
    const rotacion = -seno * 15;
    const profundidadBlur = Math.max(0, (1 - ((coseno + 1) / 2)) * 0.9);
    const activa = Math.abs(diferencia) < 0.42;

    tarjeta.style.setProperty("--carousel-x", `${desplazamientoX}px`);
    tarjeta.style.setProperty("--carousel-z", `${profundidad}px`);
    tarjeta.style.setProperty("--carousel-scale", escala.toFixed(3));
    tarjeta.style.setProperty("--carousel-rotate", `${rotacion.toFixed(2)}deg`);
    tarjeta.style.setProperty("--carousel-opacity", opacidad.toFixed(3));
    tarjeta.style.setProperty("--carousel-zindex", String(Math.round((coseno + 1) * 50)));
    tarjeta.style.setProperty("--depth-blur", `${profundidadBlur.toFixed(2)}px`);
    tarjeta.classList.toggle("is-active", activa);
    tarjeta.setAttribute("aria-current", activa ? "true" : "false");
    tarjeta.tabIndex = activa ? 0 : -1;
  });

  if (!estado.carouselArrastrando) {
    elementos.categoryRail.value = String(
      normalizarPosicionCarousel(Math.round(estado.carouselPosicion))
    );
  }
}

function moverCarouselHaciaIndice(indice) {
  const total = estado.categorias.length;

  if (!total) {
    return;
  }

  const posicionActual = normalizarPosicionCarousel(estado.carouselPosicion);
  let delta = indice - posicionActual;
  const mitad = total / 2;

  if (delta > mitad) {
    delta -= total;
  }

  if (delta < -mitad) {
    delta += total;
  }

  estado.carouselPosicion += delta;
  actualizarCarouselCategorias(true);
}

function iniciarArrastreCategorias(evento) {
  if (evento.button !== undefined && evento.button !== 0) {
    return;
  }

  if (evento.target.closest(".category-explore-button")) {
    return;
  }

  estado.carouselSeMovio = false;
  estado.carouselPointerX = evento.clientX;
  estado.carouselInicio = estado.carouselPosicion;
  estado.carouselArrastrando = true;
  elementos.categoryGrid.classList.add("is-dragging");
  elementos.categoryGrid.setPointerCapture?.(evento.pointerId);
}

function moverArrastreCategorias(evento) {
  if (!estado.carouselArrastrando) {
    return;
  }

  const desplazamiento = evento.clientX - estado.carouselPointerX;

  if (Math.abs(desplazamiento) > 6) {
    estado.carouselSeMovio = true;
  }

  estado.carouselPosicion = estado.carouselInicio - desplazamiento / 225;
  elementos.categoryRail.value = String(normalizarPosicionCarousel(estado.carouselPosicion));
  actualizarCarouselCategorias(false);
}

function terminarArrastreCategorias(evento) {
  if (!estado.carouselArrastrando) {
    return;
  }

  const desplazamiento = Math.abs(evento.clientX - estado.carouselPointerX);
  estado.carouselArrastrando = false;
  estado.carouselPosicion = Math.round(estado.carouselPosicion);
  elementos.categoryGrid.classList.remove("is-dragging");

  if (desplazamiento > 7 || estado.carouselSeMovio) {
    estado.carouselBloquearClickHasta = Date.now() + 260;
  }

  elementos.categoryGrid.releasePointerCapture?.(evento.pointerId);
  actualizarCarouselCategorias(true);
}

function sincronizarCarouselDesdeRail() {
  estado.carouselArrastrando = true;
  estado.carouselPosicion = Number(elementos.categoryRail.value);
  actualizarCarouselCategorias(false);
}

function terminarControlRail() {
  estado.carouselArrastrando = false;
  estado.carouselPosicion = Math.round(Number(elementos.categoryRail.value));
  actualizarCarouselCategorias(true);
}

async function hidratarEstadoPersistido() {
  estado.ultimaCotizacion = CubiqsStorage.obtenerUltimaCotizacion();
  actualizarBotonUltimaCotizacion();

  if (CubiqsStorage.obtenerVista() === "confirmada" && estado.ultimaCotizacion) {
    mostrarCotizacionFinal(estado.ultimaCotizacion);
    return;
  }

  const borrador = CubiqsStorage.obtenerBorrador();

  if (borrador?.items?.length) {
    await preguntarRecuperacionBorrador(borrador);
    return;
  }

  estado.cotizacion = normalizarBorrador(borrador || crearBorradorVacio());
  actualizarInterfazCotizacion();
}

async function preguntarRecuperacionBorrador(borrador) {
  const cantidad = borrador.items.length;
  const resultado = await Swal.fire({
    ...configuracionSweetAlert(),
    title: "Cotización en progreso",
    html: `Encontramos un borrador con <strong>${cantidad} ${cantidad === 1 ? "servicio seleccionado" : "servicios seleccionados"}</strong>.`,
    showCancelButton: true,
    confirmButtonText: "Continuar",
    cancelButtonText: "Empezar de nuevo",
    reverseButtons: true
  });

  if (resultado.isConfirmed) {
    estado.cotizacion = normalizarBorrador(borrador);
    mostrarToast("Borrador recuperado", "✓");
  } else {
    estado.cotizacion = crearBorradorVacio();
    CubiqsStorage.eliminarBorrador();
  }

  CubiqsStorage.guardarVista("catalogo");
  actualizarInterfazCotizacion();
}

function normalizarBorrador(borrador) {
  const cliente = borrador?.cliente || {};
  const items = Array.isArray(borrador?.items) ? borrador.items : [];

  return {
    items,
    cliente: {
      nombre: cliente.nombre || "",
      empresa: cliente.empresa || "",
      email: cliente.email || "",
      plazo: cliente.plazo || "Sin fecha definida",
      objetivo: cliente.objetivo || ""
    },
    actualizadoEn: borrador?.actualizadoEn || new Date().toISOString()
  };
}

function persistirBorrador() {
  estado.cotizacion.actualizadoEn = new Date().toISOString();

  try {
    if (estado.cotizacion.items.length === 0 && !tieneDatosCliente()) {
      CubiqsStorage.eliminarBorrador();
    } else {
      CubiqsStorage.guardarBorrador(estado.cotizacion);
    }

    indicarAutoguardado();
  } catch (error) {
    mostrarToast("No pudimos guardar el borrador", "!");
  }
}

function tieneDatosCliente() {
  const { nombre, empresa, email, objetivo } = estado.cotizacion.cliente;
  return Boolean(nombre || empresa || email || objetivo);
}

function indicarAutoguardado() {
  if (!elementos.autosaveIndicator) {
    return;
  }

  elementos.autosaveIndicator.textContent = "Guardado";

  window.setTimeout(() => {
    elementos.autosaveIndicator.textContent = "Guardado automático";
  }, 1200);
}

function obtenerServicio(servicioId) {
  return estado.servicios.find(({ id }) => id === Number(servicioId));
}

function obtenerItemCotizacion(servicioId) {
  return estado.cotizacion.items.find(({ servicioId: id }) => id === Number(servicioId));
}

function servicioSeleccionado(servicioId) {
  return estado.cotizacion.items.some(({ servicioId: id }) => id === Number(servicioId));
}

function calcularTotal() {
  return estado.cotizacion.items.reduce((total, { servicioId, cantidad }) => {
    const servicio = obtenerServicio(servicioId);
    return servicio ? total + servicio.precio * cantidad : total;
  }, 0);
}

function cantidadItems() {
  return estado.cotizacion.items.length;
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
  abrirCapa(elementos.serviceModal, elementos.btnCloseServiceModal);
}

function renderizarServiciosCategoria() {
  const servicios = estado.servicios.filter(({ categoriaId }) => categoriaId === estado.categoriaActiva);
  elementos.serviceModal.classList.toggle("is-compact", servicios.length <= 2);
  elementos.serviceModalList.innerHTML = servicios.map(renderizarServicio).join("");
}

function renderizarServicio(servicio) {
  const {
    id,
    nombre,
    descripcion,
    precio,
    modalidad,
    unidad,
    cantidadEditable
  } = servicio;

  const seleccionado = servicioSeleccionado(id);
  const item = obtenerItemCotizacion(id);
  const detallePrecio = modalidad === "mensual" && unidad
    ? `${formatearMoneda(precio)} / ${unidad}`
    : `Desde ${formatearMoneda(precio)}`;

  return `
    <article class="service-card" data-service-id="${id}">
      <div class="service-card-main">
        <div>
          <h3>${escaparHTML(nombre)}</h3>
          <p>${escaparHTML(descripcion)}</p>
        </div>
        <div class="service-card-bottom">
          <div class="service-price-block">
            <span>${modalidad === "mensual" ? "Valor" : "Estimación base"}</span>
            <strong>${detallePrecio}</strong>
          </div>
          <button
            class="service-add-button ${seleccionado ? "is-added" : ""}"
            type="button"
            data-action="add-service"
            data-service-id="${id}"
            ${seleccionado ? "disabled" : ""}
          >
            <span>${seleccionado ? "Agregado" : "Agregar"}</span>
            <span aria-hidden="true">${seleccionado ? "✓" : "+"}</span>
          </button>
        </div>
      </div>
      ${cantidadEditable && seleccionado ? `
        <div class="service-selected-note">
          <span>Configurado por ${item?.cantidad || 1} ${pluralUnidad(unidad, item?.cantidad || 1)}</span>
          <span>Podés modificarlo desde tu cotización.</span>
        </div>
      ` : ""}
    </article>
  `;
}

function agregarServicio(servicioId) {
  const servicio = obtenerServicio(servicioId);

  if (!servicio || servicioSeleccionado(servicio.id)) {
    return;
  }

  estado.cotizacion.items.push({
    servicioId: servicio.id,
    cantidad: servicio.cantidadMinima || 1
  });

  persistirBorrador();
  actualizarInterfazCotizacion();
  renderizarServiciosCategoria();
  mostrarToast(`${servicio.nombre} agregado`, "✓");
}

function eliminarServicio(servicioId) {
  const servicio = obtenerServicio(servicioId);

  estado.cotizacion.items = estado.cotizacion.items.filter(
    ({ servicioId: id }) => id !== Number(servicioId)
  );

  persistirBorrador();
  actualizarInterfazCotizacion();

  if (estado.categoriaActiva) {
    renderizarServiciosCategoria();
  }

  if (!elementos.reviewView.hidden) {
    if (estado.cotizacion.items.length === 0) {
      mostrarVistaCatalogo();
    } else {
      renderizarRevision();
    }
  }

  mostrarToast(`${servicio?.nombre || "Servicio"} eliminado`, "×");
}

function modificarCantidad(servicioId, cambio) {
  const servicio = obtenerServicio(servicioId);
  const item = obtenerItemCotizacion(servicioId);

  if (!servicio || !item || !servicio.cantidadEditable) {
    return;
  }

  const minimo = servicio.cantidadMinima || 1;
  const maximo = servicio.cantidadMaxima || 99;
  const nuevaCantidad = item.cantidad + cambio;

  if (nuevaCantidad < minimo || nuevaCantidad > maximo) {
    mostrarToast(`La cantidad permitida es de ${minimo} a ${maximo}`, "i");
    return;
  }

  item.cantidad = nuevaCantidad;
  persistirBorrador();
  actualizarInterfazCotizacion();

  if (!elementos.reviewView.hidden) {
    renderizarRevision();
  }
}

function actualizarInterfazCotizacion() {
  const cantidad = cantidadItems();
  const total = calcularTotal();

  elementos.headerQuoteCount.textContent = cantidad;
  elementos.fabCount.textContent = `${cantidad} ${cantidad === 1 ? "servicio" : "servicios"}`;
  elementos.fabTotal.textContent = formatearMoneda(total);
  elementos.drawerCount.textContent = `${cantidad} ${cantidad === 1 ? "servicio seleccionado" : "servicios seleccionados"}`;
  elementos.drawerTotal.textContent = formatearMoneda(total);

  const catalogoActivo = elementos.catalogView.classList.contains("view-active") && !elementos.catalogView.hidden;
  elementos.quoteFab.hidden = cantidad === 0 || !catalogoActivo;
  elementos.quoteEmpty.hidden = cantidad > 0;
  elementos.quoteItems.hidden = cantidad === 0;
  elementos.quoteFooter.hidden = cantidad === 0;

  renderizarItemsCotizacion();
}

function renderizarItemsCotizacion() {
  elementos.quoteItems.innerHTML = estado.cotizacion.items
    .map(({ servicioId, cantidad }) => {
      const servicio = obtenerServicio(servicioId);

      if (!servicio) {
        return "";
      }

      const subtotal = servicio.precio * cantidad;
      const unidad = servicio.unidad || "unidad";

      return `
        <article class="quote-item" data-service-id="${servicio.id}">
          <div class="quote-item-top">
            <div>
              <h3>${escaparHTML(servicio.nombre)}</h3>
              <p>${servicio.modalidad === "mensual" ? `${formatearMoneda(servicio.precio)} / ${unidad}` : "Proyecto"}</p>
            </div>
            <button class="remove-item-button" type="button" data-action="remove-service" data-service-id="${servicio.id}" aria-label="Eliminar ${escaparHTML(servicio.nombre)}">×</button>
          </div>
          <div class="quote-item-bottom">
            ${servicio.cantidadEditable ? `
              <div class="quantity-stepper" aria-label="Cantidad de ${escaparHTML(servicio.nombre)}">
                <button type="button" data-action="decrease" data-service-id="${servicio.id}" aria-label="Reducir cantidad">−</button>
                <span class="quantity-value">${cantidad}</span>
                <button type="button" data-action="increase" data-service-id="${servicio.id}" aria-label="Aumentar cantidad">+</button>
              </div>
            ` : `<span class="fixed-quantity">Cantidad fija</span>`}
            <strong>${formatearMoneda(subtotal)}</strong>
          </div>
        </article>
      `;
    })
    .join("");
}

async function vaciarCotizacion() {
  if (estado.cotizacion.items.length === 0) {
    return;
  }

  const resultado = await Swal.fire({
    ...configuracionSweetAlert(),
    title: "¿Vaciar cotización?",
    text: "Se eliminarán todos los servicios del borrador actual.",
    showCancelButton: true,
    confirmButtonText: "Vaciar",
    cancelButtonText: "Cancelar",
    reverseButtons: true
  });

  if (!resultado.isConfirmed) {
    return;
  }

  estado.cotizacion = crearBorradorVacio();
  CubiqsStorage.eliminarBorrador();
  actualizarInterfazCotizacion();
  cerrarDrawer();
  mostrarToast("Cotización vaciada", "✓");
}

function mostrarVistaCatalogo() {
  cerrarTodasLasCapas();
  elementos.catalogView.hidden = false;
  elementos.reviewView.hidden = true;
  elementos.successView.hidden = true;
  elementos.catalogView.classList.add("view-active");
  elementos.reviewView.classList.remove("view-active");
  elementos.successView.classList.remove("view-active");
  CubiqsStorage.guardarVista("catalogo");
  actualizarInterfazCotizacion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarVistaRevision() {
  if (estado.cotizacion.items.length === 0) {
    mostrarToast("Agregá al menos un servicio", "i");
    return;
  }

  cerrarTodasLasCapas();
  elementos.catalogView.hidden = true;
  elementos.reviewView.hidden = false;
  elementos.successView.hidden = true;
  elementos.catalogView.classList.remove("view-active");
  elementos.reviewView.classList.add("view-active");
  elementos.successView.classList.remove("view-active");
  elementos.quoteFab.hidden = true;
  renderizarRevision();
  cargarFormularioDesdeEstado();
  CubiqsStorage.guardarVista("revision");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderizarRevision() {
  elementos.reviewItemCount.textContent = estado.cotizacion.items.length;
  elementos.reviewTotal.textContent = formatearMoneda(calcularTotal());

  elementos.reviewItems.innerHTML = estado.cotizacion.items
    .map(({ servicioId, cantidad }) => {
      const servicio = obtenerServicio(servicioId);

      if (!servicio) {
        return "";
      }

      const subtotal = servicio.precio * cantidad;
      const cantidadDetalle = servicio.cantidadEditable
        ? `${cantidad} ${pluralUnidad(servicio.unidad, cantidad)} × ${formatearMoneda(servicio.precio)}`
        : "Proyecto";

      return `
        <article class="review-item">
          <div>
            <h3>${escaparHTML(servicio.nombre)}</h3>
            <p>${cantidadDetalle}</p>
          </div>
          <div class="review-item-actions">
            <strong>${formatearMoneda(subtotal)}</strong>
            <button type="button" data-action="remove-review-service" data-service-id="${servicio.id}">Eliminar</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function establecerPlazoSeleccionado(valor, notificar = false) {
  const valorSeguro = valor || "Sin fecha definida";
  elementos.clientTimeline.value = valorSeguro;
  elementos.timelineSelectValue.textContent = valorSeguro;

  elementos.timelineSelectMenu
    .querySelectorAll(".custom-select-option")
    .forEach((opcion) => {
      const seleccionada = opcion.dataset.value === valorSeguro;
      opcion.classList.toggle("is-selected", seleccionada);
      opcion.setAttribute("aria-selected", String(seleccionada));
    });

  if (notificar) {
    elementos.clientTimeline.dispatchEvent(new Event("input", { bubbles: true }));
    elementos.clientTimeline.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function abrirSelectorPlazo() {
  elementos.timelineSelectMenu.hidden = false;
  elementos.timelineSelect.classList.add("is-open");
  elementos.timelineSelectTrigger.setAttribute("aria-expanded", "true");
}

function cerrarSelectorPlazo() {
  elementos.timelineSelect.classList.remove("is-open");
  elementos.timelineSelectTrigger.setAttribute("aria-expanded", "false");
  elementos.timelineSelectMenu.hidden = true;
}

function alternarSelectorPlazo() {
  elementos.timelineSelect.classList.contains("is-open")
    ? cerrarSelectorPlazo()
    : abrirSelectorPlazo();
}

function cargarFormularioDesdeEstado() {
  const { nombre, empresa, email, plazo, objetivo } = estado.cotizacion.cliente;
  elementos.clientName.value = nombre;
  elementos.clientCompany.value = empresa;
  elementos.clientEmail.value = email;
  establecerPlazoSeleccionado(plazo || "Sin fecha definida");
  elementos.clientObjective.value = objetivo;
  actualizarContadorObjetivo();
}

function guardarClienteDesdeFormulario() {
  estado.cotizacion.cliente = {
    nombre: elementos.clientName.value.trim(),
    empresa: elementos.clientCompany.value.trim(),
    email: elementos.clientEmail.value.trim(),
    plazo: elementos.clientTimeline.value || "Sin fecha definida",
    objetivo: elementos.clientObjective.value.trim()
  };

  persistirBorrador();
}

function actualizarContadorObjetivo() {
  elementos.objectiveCount.textContent = `${elementos.clientObjective.value.length} / 500`;
}

function validarFormularioCliente() {
  limpiarErroresFormulario();

  const nombre = elementos.clientName.value.trim();
  const email = elementos.clientEmail.value.trim();
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  let valido = true;

  if (nombre.length < 3) {
    mostrarErrorCampo("client-name", "Ingresá tu nombre y apellido.");
    valido = false;
  }

  if (!emailValido) {
    mostrarErrorCampo("client-email", "Ingresá un email válido.");
    valido = false;
  }

  return valido;
}

function mostrarErrorCampo(campoId, mensaje) {
  const campo = document.querySelector(`#${campoId}`);
  const error = document.querySelector(`#error-${campoId}`);
  campo.setAttribute("aria-invalid", "true");
  campo.classList.add("has-error");
  error.textContent = mensaje;
}

function limpiarErroresFormulario() {
  elementos.clientForm.querySelectorAll("[aria-invalid='true']").forEach((campo) => {
    campo.removeAttribute("aria-invalid");
    campo.classList.remove("has-error");
  });

  elementos.clientForm.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

async function confirmarCotizacion() {
  guardarClienteDesdeFormulario();

  if (!validarFormularioCliente()) {
    mostrarToast("Revisá los datos indicados", "!");
    return;
  }

  const total = calcularTotal();
  const cantidad = estado.cotizacion.items.length;
  const resultado = await Swal.fire({
    ...configuracionSweetAlert(),
    title: "Confirmar cotización",
    html: `Vas a generar una cotización con <strong>${cantidad} ${cantidad === 1 ? "servicio" : "servicios"}</strong> por una estimación de <strong>${formatearMoneda(total)}</strong>.`,
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Volver",
    reverseButtons: true
  });

  if (!resultado.isConfirmed) {
    return;
  }

  const cotizacionFinal = construirCotizacionFinal();

  try {
    CubiqsStorage.guardarUltimaCotizacion(cotizacionFinal);
    CubiqsStorage.eliminarBorrador();
    CubiqsStorage.guardarVista("confirmada");
    estado.ultimaCotizacion = cotizacionFinal;
    estado.cotizacion = crearBorradorVacio();
    actualizarBotonUltimaCotizacion();
    mostrarCotizacionFinal(cotizacionFinal);
  } catch (error) {
    await Swal.fire({
      ...configuracionSweetAlert(),
      title: "No pudimos guardar la cotización",
      text: "La información está lista, pero el navegador no permitió almacenarla. Intentá nuevamente.",
      confirmButtonText: "Entendido"
    });
  }
}

function construirCotizacionFinal() {
  const fecha = new Date();
  const servicios = estado.cotizacion.items
    .map(({ servicioId, cantidad }) => {
      const servicio = obtenerServicio(servicioId);

      return servicio
        ? {
            id: servicio.id,
            nombre: servicio.nombre,
            precio: servicio.precio,
            cantidad,
            unidad: servicio.unidad,
            modalidad: servicio.modalidad,
            subtotal: servicio.precio * cantidad
          }
        : null;
    })
    .filter(Boolean);

  return {
    id: generarIdCotizacion(fecha),
    fecha: fecha.toISOString(),
    estado: "confirmada",
    cliente: { ...estado.cotizacion.cliente },
    servicios,
    total: servicios.reduce((suma, { subtotal }) => suma + subtotal, 0)
  };
}

function generarIdCotizacion(fecha) {
  const anio = fecha.getFullYear();
  const sufijo = String(fecha.getTime()).slice(-6);
  return `CQ-${anio}-${sufijo}`;
}

function mostrarCotizacionFinal(cotizacion) {
  if (!cotizacion) {
    return;
  }

  cerrarTodasLasCapas();
  elementos.catalogView.hidden = true;
  elementos.reviewView.hidden = true;
  elementos.successView.hidden = false;
  elementos.catalogView.classList.remove("view-active");
  elementos.reviewView.classList.remove("view-active");
  elementos.successView.classList.add("view-active");
  elementos.quoteFab.hidden = true;

  elementos.finalQuoteId.textContent = cotizacion.id;
  elementos.finalQuoteDate.textContent = formatearFecha(cotizacion.fecha);
  elementos.finalTotal.textContent = formatearMoneda(cotizacion.total);

  const { nombre, empresa, email, plazo, objetivo } = cotizacion.cliente;
  elementos.finalClientSummary.innerHTML = `
    <div>
      <span>Cliente</span>
      <strong>${escaparHTML(nombre)}</strong>
      <small>${escaparHTML(empresa || "Sin empresa indicada")}</small>
    </div>
    <div>
      <span>Contacto</span>
      <strong>${escaparHTML(email)}</strong>
      <small>${escaparHTML(plazo || "Sin fecha definida")}</small>
    </div>
    ${objetivo ? `
      <div class="final-objective">
        <span>Objetivo</span>
        <p>${escaparHTML(objetivo)}</p>
      </div>
    ` : ""}
  `;

  elementos.finalServices.innerHTML = cotizacion.servicios
    .map(({ nombre: servicioNombre, cantidad, unidad, modalidad, subtotal }) => {
      const detalle = modalidad === "mensual" && unidad
        ? `${cantidad} ${pluralUnidad(unidad, cantidad)}`
        : "Proyecto";

      return `
        <div class="final-service-row">
          <div>
            <strong>${escaparHTML(servicioNombre)}</strong>
            <span>${detalle}</span>
          </div>
          <strong>${formatearMoneda(subtotal)}</strong>
        </div>
      `;
    })
    .join("");

  CubiqsStorage.guardarVista("confirmada");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function actualizarBotonUltimaCotizacion() {
  elementos.btnLastQuote.hidden = !estado.ultimaCotizacion;
}

function construirResumenTexto(cotizacion) {
  const { nombre, empresa, email, plazo, objetivo } = cotizacion.cliente;
  const servicios = cotizacion.servicios
    .map(({ nombre: servicioNombre, cantidad, unidad, modalidad, subtotal }) => {
      const cantidadTexto = modalidad === "mensual" && unidad
        ? ` — ${cantidad} ${pluralUnidad(unidad, cantidad)}`
        : "";
      return `• ${servicioNombre}${cantidadTexto} — ${formatearMoneda(subtotal)}`;
    })
    .join("\n");

  return [
    `Cotización ${cotizacion.id}`,
    `Fecha: ${formatearFecha(cotizacion.fecha)}`,
    "",
    `Nombre: ${nombre}`,
    empresa ? `Empresa: ${empresa}` : "",
    `Email: ${email}`,
    `Momento estimado: ${plazo || "Sin fecha definida"}`,
    "",
    "Servicios:",
    servicios,
    "",
    `Estimación total: ${formatearMoneda(cotizacion.total)}`,
    objetivo ? `\nObjetivo del proyecto:\n${objetivo}` : ""
  ]
    .filter((linea) => linea !== "")
    .join("\n");
}

function construirMensajeWhatsApp(cotizacion) {
  const { nombre, plazo, objetivo } = cotizacion.cliente;
  const servicios = cotizacion.servicios
    .map(({ nombre: servicioNombre, cantidad, unidad, modalidad }) => {
      const cantidadTexto = modalidad === "mensual" && unidad
        ? ` — ${cantidad} ${pluralUnidad(unidad, cantidad)}`
        : "";
      return `• ${servicioNombre}${cantidadTexto}`;
    })
    .join("\n");

  const encabezadoServicios = cotizacion.servicios.length === 1
    ? "Estoy interesado en el siguiente servicio:"
    : "Estoy interesado en los siguientes servicios:";

  return [
    `Hola, soy ${nombre}.`,
    "",
    `Acabo de generar la cotización ${cotizacion.id} desde la web de Cubiqs y me gustaría conversar sobre los próximos pasos.`,
    "",
    encabezadoServicios,
    servicios,
    "",
    `Estimación generada: ${formatearMoneda(cotizacion.total)}`,
    `Momento estimado: ${plazo || "Sin fecha definida"}`,
    objetivo ? `\nObjetivo:\n${objetivo}` : "",
    "",
    "¿Podemos revisar el alcance con el equipo?"
  ]
    .filter((linea) => linea !== "")
    .join("\n");
}

function abrirWhatsApp() {
  if (!estado.ultimaCotizacion) {
    return;
  }

  const mensaje = construirMensajeWhatsApp(estado.ultimaCotizacion);
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function copiarResumen() {
  if (!estado.ultimaCotizacion) {
    return;
  }

  try {
    await navigator.clipboard.writeText(construirResumenTexto(estado.ultimaCotizacion));
    mostrarToast("Resumen copiado", "✓");
  } catch (error) {
    mostrarToast("No pudimos copiar el resumen", "!");
  }
}

async function iniciarNuevaCotizacion() {
  const resultado = await Swal.fire({
    ...configuracionSweetAlert(),
    title: "Nueva cotización",
    text: "La última cotización seguirá guardada y podrás consultarla desde el encabezado.",
    showCancelButton: true,
    confirmButtonText: "Empezar",
    cancelButtonText: "Cancelar",
    reverseButtons: true
  });

  if (!resultado.isConfirmed) {
    return;
  }

  estado.cotizacion = crearBorradorVacio();
  CubiqsStorage.vaciarEstadoTemporal();
  CubiqsStorage.guardarVista("catalogo");
  mostrarVistaCatalogo();
}

function abrirCapa(elemento, elementoFoco) {
  elementos.overlay.hidden = false;

  requestAnimationFrame(() => {
    elementos.overlay.classList.add("is-open");
    elemento.classList.add("is-open");
    elemento.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");
    elementoFoco?.focus();
  });
}

function cerrarCapa(elemento) {
  elemento.classList.remove("is-open");
  elemento.setAttribute("aria-hidden", "true");

  const algunaAbierta = elementos.serviceModal.classList.contains("is-open") ||
    elementos.quoteDrawer.classList.contains("is-open");

  if (!algunaAbierta) {
    elementos.overlay.classList.remove("is-open");
    document.body.classList.remove("overlay-open");

    window.setTimeout(() => {
      elementos.overlay.hidden = true;
    }, 220);
  }
}

function cerrarModalServicios() {
  cerrarCapa(elementos.serviceModal);
  estado.categoriaActiva = null;
}

function abrirDrawer() {
  actualizarInterfazCotizacion();
  abrirCapa(elementos.quoteDrawer, elementos.btnCloseDrawer);
  elementos.btnHeaderQuote.setAttribute("aria-expanded", "true");
  elementos.quoteFab.setAttribute("aria-expanded", "true");
}

function cerrarDrawer() {
  cerrarCapa(elementos.quoteDrawer);
  elementos.btnHeaderQuote.setAttribute("aria-expanded", "false");
  elementos.quoteFab.setAttribute("aria-expanded", "false");
}

function cerrarTodasLasCapas() {
  elementos.serviceModal.classList.remove("is-open");
  elementos.quoteDrawer.classList.remove("is-open");
  elementos.serviceModal.setAttribute("aria-hidden", "true");
  elementos.quoteDrawer.setAttribute("aria-hidden", "true");
  elementos.overlay.classList.remove("is-open");
  elementos.overlay.hidden = true;
  document.body.classList.remove("overlay-open");
  elementos.btnHeaderQuote.setAttribute("aria-expanded", "false");
  elementos.quoteFab.setAttribute("aria-expanded", "false");
  estado.categoriaActiva = null;
}

function manejarAccionCotizacion(evento) {
  const boton = evento.target.closest("button[data-action]");

  if (!boton) {
    return;
  }

  const servicioId = Number(boton.dataset.serviceId);
  const accion = boton.dataset.action;

  if (accion === "remove-service" || accion === "remove-review-service") {
    eliminarServicio(servicioId);
  }

  if (accion === "increase") {
    modificarCantidad(servicioId, 1);
  }

  if (accion === "decrease") {
    modificarCantidad(servicioId, -1);
  }
}

function registrarEventos() {
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

    if (Date.now() < estado.carouselBloquearClickHasta || estado.carouselSeMovio) {
      return;
    }

    const indice = Number(tarjeta.dataset.categoryIndex);

    if (!tarjeta.classList.contains("is-active")) {
      moverCarouselHaciaIndice(indice);
      return;
    }

    abrirCategoria(tarjeta.dataset.categoryId);
  });

  elementos.categoryGrid.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter" && evento.key !== " ") {
      return;
    }

    const tarjeta = evento.target.closest(".category-stage.is-active");

    if (!tarjeta || evento.target.closest(".category-explore-button")) {
      return;
    }

    evento.preventDefault();
    abrirCategoria(tarjeta.dataset.categoryId);
  });

  elementos.categoryGrid.addEventListener("pointerdown", iniciarArrastreCategorias);
  elementos.categoryGrid.addEventListener("pointermove", moverArrastreCategorias);
  elementos.categoryGrid.addEventListener("pointerup", terminarArrastreCategorias);
  elementos.categoryGrid.addEventListener("pointercancel", terminarArrastreCategorias);

  elementos.categoryRail.addEventListener("input", sincronizarCarouselDesdeRail);
  elementos.categoryRail.addEventListener("change", terminarControlRail);
  elementos.categoryRail.addEventListener("pointerup", terminarControlRail);

  window.addEventListener("resize", () => actualizarCarouselCategorias(false));

  elementos.serviceModalList.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-action='add-service']");
    if (boton) {
      agregarServicio(Number(boton.dataset.serviceId));
    }
  });

  elementos.quoteItems.addEventListener("click", manejarAccionCotizacion);
  elementos.reviewItems.addEventListener("click", manejarAccionCotizacion);

  elementos.btnRetry.addEventListener("click", cargarCatalogo);
  elementos.btnCloseServiceModal.addEventListener("click", cerrarModalServicios);
  elementos.btnCloseDrawer.addEventListener("click", cerrarDrawer);
  elementos.btnHeaderQuote.addEventListener("click", abrirDrawer);
  elementos.quoteFab.addEventListener("click", abrirDrawer);
  elementos.btnClearQuote.addEventListener("click", vaciarCotizacion);
  elementos.btnReviewQuote.addEventListener("click", mostrarVistaRevision);
  elementos.btnBackCatalog.addEventListener("click", mostrarVistaCatalogo);
  elementos.btnWhatsapp.addEventListener("click", abrirWhatsApp);
  elementos.btnCopySummary.addEventListener("click", copiarResumen);
  elementos.btnNewQuote.addEventListener("click", iniciarNuevaCotizacion);
  elementos.btnLastQuote.addEventListener("click", () => {
    if (estado.ultimaCotizacion) {
      mostrarCotizacionFinal(estado.ultimaCotizacion);
    }
  });

  elementos.overlay.addEventListener("click", () => {
    if (elementos.serviceModal.classList.contains("is-open")) {
      cerrarModalServicios();
    }

    if (elementos.quoteDrawer.classList.contains("is-open")) {
      cerrarDrawer();
    }
  });

  elementos.timelineSelectTrigger.addEventListener("click", alternarSelectorPlazo);

  elementos.timelineSelectMenu.addEventListener("click", (evento) => {
    const opcion = evento.target.closest(".custom-select-option");

    if (!opcion) {
      return;
    }

    establecerPlazoSeleccionado(opcion.dataset.value, true);
    cerrarSelectorPlazo();
    elementos.timelineSelectTrigger.focus();
  });

  document.addEventListener("click", (evento) => {
    if (!elementos.timelineSelect.contains(evento.target)) {
      cerrarSelectorPlazo();
    }
  });

  elementos.clientForm.addEventListener("input", (evento) => {
    guardarClienteDesdeFormulario();

    if (evento.target === elementos.clientObjective) {
      actualizarContadorObjetivo();
    }
  });

  elementos.clientForm.addEventListener("change", guardarClienteDesdeFormulario);

  elementos.clientForm.addEventListener("submit", (evento) => {
    evento.preventDefault();
    confirmarCotizacion();
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") {
      return;
    }

    if (elementos.timelineSelect.classList.contains("is-open")) {
      cerrarSelectorPlazo();
      elementos.timelineSelectTrigger.focus();
      return;
    }

    if (elementos.serviceModal.classList.contains("is-open")) {
      cerrarModalServicios();
      return;
    }

    if (elementos.quoteDrawer.classList.contains("is-open")) {
      cerrarDrawer();
    }
  });
}

renderizarSkeletons();
registrarEventos();
cargarCatalogo();
