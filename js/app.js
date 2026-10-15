const RUTA_CATALOGO = "./data/servicios.json";
const NUMERO_WHATSAPP = "5493812091755";

const estado = {
  categorias: [],
  servicios: [],
  cotizacion: {
    items: [],
    cliente: {
      nombre: "",
      empresa: "",
      email: "",
      plazo: "Sin fecha definida",
      objetivo: ""
    }
  },
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
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  categorySection: document.querySelector("#category-section"),
  categoryGrid: document.querySelector("#category-grid"),
  categoryRail: document.querySelector("#category-rail"),
  btnRetry: document.querySelector("#btn-retry"),
  btnHeaderQuote: document.querySelector("#btn-header-cotizacion"),
  btnLastQuote: document.querySelector("#btn-ultima-cotizacion"),
  headerQuoteCount: document.querySelector("#header-quote-count"),
  quoteFab: document.querySelector("#quote-fab"),
  fabCount: document.querySelector("#fab-count"),
  fabTotal: document.querySelector("#fab-total"),
  modalOverlay: document.querySelector("#modal-overlay"),
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
  catalogView: document.querySelector("#catalog-view"),
  reviewView: document.querySelector("#review-view"),
  successView: document.querySelector("#success-view"),
  btnBackCatalog: document.querySelector("#btn-back-catalog"),
  reviewItems: document.querySelector("#review-items"),
  reviewItemCount: document.querySelector("#review-item-count"),
  reviewTotal: document.querySelector("#review-total"),
  clientForm: document.querySelector("#client-form"),
  clientName: document.querySelector("#client-name"),
  clientCompany: document.querySelector("#client-company"),
  clientEmail: document.querySelector("#client-email"),
  clientTimeline: document.querySelector("#client-timeline"),
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
  position: "bottom-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true
});

function crearCotizacionVacia() {
  return {
    items: [],
    cliente: {
      nombre: "",
      empresa: "",
      email: "",
      plazo: "Sin fecha definida",
      objetivo: ""
    }
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

function mostrarToast(mensaje) {
  Toast.fire({
    text: mensaje
  });
}

function pluralUnidad(unidad, cantidad) {
  if (!unidad || cantidad === 1) {
    return unidad || "unidad";
  }

  return unidad === "mes" ? "meses" : `${unidad}s`;
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
  abrirCapa(elementos.serviceModal, elementos.btnCloseServiceModal);
}

function renderizarServiciosCategoria() {
  const servicios = estado.servicios.filter(
    ({ categoriaId }) => categoriaId === estado.categoriaActiva
  );

  elementos.serviceModalList.innerHTML = servicios.map(renderizarServicio).join("");
}

function renderizarServicio(servicio) {
  const { id, nombre, descripcion, precio, modalidad, unidad } = servicio;
  const seleccionado = servicioSeleccionado(id);
  const precioTexto = modalidad === "mensual" && unidad
    ? `${formatearMoneda(precio)} / ${unidad}`
    : `Desde ${formatearMoneda(precio)}`;

  return `
    <article class="service-card" data-service-id="${id}">
      <div class="service-card-copy">
        <h3>${escaparHTML(nombre)}</h3>
        <p>${escaparHTML(descripcion)}</p>
      </div>
      <div class="service-card-bottom">
        <div class="service-price">
          <span>${modalidad === "mensual" ? "Valor" : "Estimación base"}</span>
          <strong>${precioTexto}</strong>
        </div>
        <button
          class="service-add ${seleccionado ? "is-added" : ""}"
          type="button"
          data-action="add-service"
          data-service-id="${id}"
          ${seleccionado ? "disabled" : ""}
        >
          ${seleccionado ? "Agregado" : "Agregar"}
        </button>
      </div>
    </article>
  `;
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

function guardarBorrador() {
  if (estado.cotizacion.items.length === 0) {
    CubiqsStorage.eliminarBorrador();
    return;
  }

  CubiqsStorage.guardarBorrador(estado.cotizacion);
}

function recuperarBorrador() {
  const borrador = CubiqsStorage.obtenerBorrador();

  if (!borrador?.items?.length) {
    return;
  }

  estado.cotizacion.items = borrador.items
    .map(({ servicioId, cantidad }) => {
      const servicio = obtenerServicio(servicioId);

      if (!servicio) {
        return null;
      }

      const minimo = servicio.cantidadMinima || 1;
      const maximo = servicio.cantidadMaxima || minimo;
      const cantidadValida = servicio.cantidadEditable
        ? Math.min(maximo, Math.max(minimo, Number(cantidad) || minimo))
        : minimo;

      return {
        servicioId: servicio.id,
        cantidad: cantidadValida
      };
    })
    .filter(Boolean);

  const cliente = borrador.cliente || {};
  estado.cotizacion.cliente = {
    nombre: cliente.nombre || "",
    empresa: cliente.empresa || "",
    email: cliente.email || "",
    plazo: cliente.plazo || "Sin fecha definida",
    objetivo: cliente.objetivo || ""
  };
}

function agregarServicio(servicioId) {
  const servicio = obtenerServicio(servicioId);

  if (!servicio || servicioSeleccionado(servicioId)) {
    return;
  }

  estado.cotizacion.items.push({
    servicioId: servicio.id,
    cantidad: servicio.cantidadMinima || 1
  });

  guardarBorrador();
  actualizarCotizacion();
  renderizarServiciosCategoria();
}

function eliminarServicio(servicioId) {
  estado.cotizacion.items = estado.cotizacion.items.filter(
    ({ servicioId: id }) => id !== Number(servicioId)
  );

  guardarBorrador();
  actualizarCotizacion();

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
    return;
  }

  item.cantidad = nuevaCantidad;
  guardarBorrador();
  actualizarCotizacion();
}

async function vaciarCotizacion() {
  if (estado.cotizacion.items.length === 0) {
    return;
  }

  const resultado = await Swal.fire({
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

  estado.cotizacion = crearCotizacionVacia();
  CubiqsStorage.eliminarBorrador();
  actualizarCotizacion();

  if (estado.categoriaActiva) {
    renderizarServiciosCategoria();
  }

  cerrarDrawer();
  mostrarToast("Cotización vaciada");
}

function actualizarCotizacion() {
  const cantidad = estado.cotizacion.items.length;
  const total = calcularTotal();

  elementos.headerQuoteCount.textContent = cantidad;
  elementos.fabCount.textContent = `${cantidad} ${cantidad === 1 ? "servicio" : "servicios"}`;
  elementos.fabTotal.textContent = formatearMoneda(total);
  elementos.drawerCount.textContent = `${cantidad} ${cantidad === 1 ? "servicio seleccionado" : "servicios seleccionados"}`;
  elementos.drawerTotal.textContent = formatearMoneda(total);
  elementos.quoteFab.hidden = cantidad === 0 || !elementos.reviewView.hidden;
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

      return `
        <article class="quote-item" data-service-id="${servicio.id}">
          <div class="quote-item-top">
            <div>
              <h3>${escaparHTML(servicio.nombre)}</h3>
              <p>${servicio.modalidad === "mensual" ? `${formatearMoneda(servicio.precio)} / ${servicio.unidad}` : "Proyecto"}</p>
            </div>
            <button class="remove-item" type="button" data-action="remove-service" data-service-id="${servicio.id}" aria-label="Eliminar ${escaparHTML(servicio.nombre)}">×</button>
          </div>
          <div class="quote-item-bottom">
            ${servicio.cantidadEditable ? `
              <div class="quantity-stepper" aria-label="Cantidad de ${escaparHTML(servicio.nombre)}">
                <button type="button" data-action="decrease" data-service-id="${servicio.id}" aria-label="Reducir cantidad">−</button>
                <span>${cantidad} ${pluralUnidad(servicio.unidad, cantidad)}</span>
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

function mostrarVistaRevision() {
  if (estado.cotizacion.items.length === 0) {
    return;
  }

  cerrarDrawer();
  elementos.catalogView.hidden = true;
  elementos.reviewView.hidden = false;
  elementos.successView.hidden = true;
  elementos.quoteFab.hidden = true;
  renderizarRevision();
  cargarFormularioCliente();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarVistaCatalogo() {
  elementos.reviewView.hidden = true;
  elementos.successView.hidden = true;
  elementos.catalogView.hidden = false;
  actualizarCotizacion();
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
      const detalle = servicio.cantidadEditable
        ? `${cantidad} ${pluralUnidad(servicio.unidad, cantidad)} × ${formatearMoneda(servicio.precio)}`
        : "Proyecto";

      return `
        <article class="review-item">
          <div>
            <h3>${escaparHTML(servicio.nombre)}</h3>
            <p>${detalle}</p>
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

function cargarFormularioCliente() {
  const { nombre, empresa, email, plazo, objetivo } = estado.cotizacion.cliente;
  elementos.clientName.value = nombre;
  elementos.clientCompany.value = empresa;
  elementos.clientEmail.value = email;
  elementos.clientTimeline.value = plazo || "Sin fecha definida";
  elementos.clientObjective.value = objetivo;
  actualizarContadorObjetivo();
}

function guardarCliente() {
  estado.cotizacion.cliente = {
    nombre: elementos.clientName.value.trim(),
    empresa: elementos.clientCompany.value.trim(),
    email: elementos.clientEmail.value.trim(),
    plazo: elementos.clientTimeline.value || "Sin fecha definida",
    objetivo: elementos.clientObjective.value.trim()
  };

  guardarBorrador();
  elementos.autosaveIndicator.textContent = "Guardado";

  window.setTimeout(() => {
    elementos.autosaveIndicator.textContent = "Guardado automático";
  }, 900);
}

function actualizarContadorObjetivo() {
  elementos.objectiveCount.textContent = `${elementos.clientObjective.value.length} / 500`;
}

function validarCampoCliente(campo) {
  const error = document.querySelector(`#error-${campo.id}`);

  if (!error) {
    return true;
  }

  let mensaje = "";

  if (campo === elementos.clientName && campo.value.trim().length < 3) {
    mensaje = "Ingresá tu nombre y apellido.";
  }

  if (campo === elementos.clientEmail) {
    const email = campo.value.trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      mensaje = "Ingresá un email válido.";
    }
  }

  campo.classList.toggle("has-error", Boolean(mensaje));
  campo.setAttribute("aria-invalid", String(Boolean(mensaje)));
  error.textContent = mensaje;
  return !mensaje;
}

function validarFormularioCliente() {
  const nombreValido = validarCampoCliente(elementos.clientName);
  const emailValido = validarCampoCliente(elementos.clientEmail);
  return nombreValido && emailValido;
}

async function confirmarCotizacion() {
  guardarCliente();

  if (!validarFormularioCliente()) {
    mostrarToast("Revisá los datos indicados");
    return;
  }

  const cantidad = estado.cotizacion.items.length;
  const total = calcularTotal();
  const resultado = await Swal.fire({
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
  CubiqsStorage.guardarUltimaCotizacion(cotizacionFinal);
  CubiqsStorage.eliminarBorrador();
  estado.ultimaCotizacion = cotizacionFinal;
  estado.cotizacion = crearCotizacionVacia();
  actualizarBotonUltimaCotizacion();
  actualizarCotizacion();
  mostrarCotizacionFinal(cotizacionFinal);
}

function construirCotizacionFinal() {
  const fecha = new Date();
  const servicios = estado.cotizacion.items
    .map(({ servicioId, cantidad }) => {
      const servicio = obtenerServicio(servicioId);

      if (!servicio) {
        return null;
      }

      return {
        id: servicio.id,
        nombre: servicio.nombre,
        precio: servicio.precio,
        cantidad,
        unidad: servicio.unidad,
        modalidad: servicio.modalidad,
        subtotal: servicio.precio * cantidad
      };
    })
    .filter(Boolean);

  return {
    id: generarIdCotizacion(fecha),
    fecha: fecha.toISOString(),
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

  cerrarModalServiciosSiAbierto();
  cerrarDrawerSiAbierto();
  elementos.catalogView.hidden = true;
  elementos.reviewView.hidden = true;
  elementos.successView.hidden = false;
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
    `Nombre: ${nombre}`,
    empresa ? `Empresa: ${empresa}` : "",
    `Email: ${email}`,
    `Momento estimado: ${plazo || "Sin fecha definida"}`,
    "Servicios:",
    servicios,
    `Estimación total: ${formatearMoneda(cotizacion.total)}`,
    objetivo ? `Objetivo del proyecto: ${objetivo}` : ""
  ]
    .filter(Boolean)
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

  return [
    `Hola, soy ${nombre}.`,
    `Acabo de generar la cotización ${cotizacion.id} desde la web de Cubiqs.`,
    "",
    cotizacion.servicios.length === 1 ? "Servicio seleccionado:" : "Servicios seleccionados:",
    servicios,
    "",
    `Estimación generada: ${formatearMoneda(cotizacion.total)}`,
    `Momento estimado: ${plazo || "Sin fecha definida"}`,
    objetivo ? `Objetivo: ${objetivo}` : "",
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
  window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener,noreferrer");
}

async function copiarResumen() {
  if (!estado.ultimaCotizacion) {
    return;
  }

  try {
    await navigator.clipboard.writeText(construirResumenTexto(estado.ultimaCotizacion));
    mostrarToast("Resumen copiado");
  } catch {
    mostrarToast("No pudimos copiar el resumen");
  }
}

async function iniciarNuevaCotizacion() {
  const resultado = await Swal.fire({
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

  estado.cotizacion = crearCotizacionVacia();
  CubiqsStorage.eliminarBorrador();
  mostrarVistaCatalogo();
}

function cerrarModalServiciosSiAbierto() {
  if (elementos.serviceModal.classList.contains("is-open")) {
    cerrarModalServicios();
  }
}

function cerrarDrawerSiAbierto() {
  if (elementos.quoteDrawer.classList.contains("is-open")) {
    cerrarDrawer();
  }
}

function abrirCapa(elemento, foco) {
  elementos.modalOverlay.hidden = false;
  elemento.hidden = false;

  requestAnimationFrame(() => {
    elementos.modalOverlay.classList.add("is-open");
    elemento.classList.add("is-open");
    elemento.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    foco?.focus();
  });
}

function cerrarCapa(elemento) {
  elemento.classList.remove("is-open");
  elemento.setAttribute("aria-hidden", "true");
  elementos.modalOverlay.classList.remove("is-open");
  document.body.classList.remove("modal-open");

  window.setTimeout(() => {
    elemento.hidden = true;
    elementos.modalOverlay.hidden = true;
  }, 220);
}

function cerrarModalServicios() {
  cerrarCapa(elementos.serviceModal);
  estado.categoriaActiva = null;
}

function abrirDrawer() {
  actualizarCotizacion();
  abrirCapa(elementos.quoteDrawer, elementos.btnCloseDrawer);
  elementos.btnHeaderQuote.setAttribute("aria-expanded", "true");
  elementos.quoteFab.setAttribute("aria-expanded", "true");
}

function cerrarDrawer() {
  cerrarCapa(elementos.quoteDrawer);
  elementos.btnHeaderQuote.setAttribute("aria-expanded", "false");
  elementos.quoteFab.setAttribute("aria-expanded", "false");
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
    estado.ultimaCotizacion = CubiqsStorage.obtenerUltimaCotizacion();
    recuperarBorrador();
    renderizarCategorias();
    elementos.categorySection.hidden = false;
    actualizarCotizacion();
    actualizarBotonUltimaCotizacion();
  } catch (error) {
    elementos.errorState.hidden = false;
  } finally {
    estado.cargando = false;
    elementos.loadingState.hidden = true;
  }
}

function manejarAccionCotizacion(evento) {
  const boton = evento.target.closest("button[data-action]");

  if (!boton) {
    return;
  }

  const servicioId = Number(boton.dataset.serviceId);

  if (boton.dataset.action === "remove-service" || boton.dataset.action === "remove-review-service") {
    eliminarServicio(servicioId);
  }

  if (boton.dataset.action === "increase") {
    modificarCantidad(servicioId, 1);
  }

  if (boton.dataset.action === "decrease") {
    modificarCantidad(servicioId, -1);
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
elementos.btnHeaderQuote.addEventListener("click", abrirDrawer);
elementos.quoteFab.addEventListener("click", abrirDrawer);
elementos.btnCloseDrawer.addEventListener("click", cerrarDrawer);
elementos.btnReviewQuote.addEventListener("click", mostrarVistaRevision);
elementos.btnBackCatalog.addEventListener("click", mostrarVistaCatalogo);
elementos.btnClearQuote.addEventListener("click", vaciarCotizacion);

elementos.clientForm.addEventListener("input", (evento) => {
  guardarCliente();

  if (evento.target === elementos.clientObjective) {
    actualizarContadorObjetivo();
  }

  if (evento.target.classList.contains("has-error")) {
    validarCampoCliente(evento.target);
  }
});

elementos.clientForm.addEventListener("change", guardarCliente);

elementos.clientForm.addEventListener("focusout", (evento) => {
  if (evento.target === elementos.clientName || evento.target === elementos.clientEmail) {
    validarCampoCliente(evento.target);
  }
});

elementos.clientForm.addEventListener("submit", (evento) => {
  evento.preventDefault();
  confirmarCotizacion();
});

elementos.btnWhatsapp.addEventListener("click", abrirWhatsApp);
elementos.btnCopySummary.addEventListener("click", copiarResumen);
elementos.btnNewQuote.addEventListener("click", iniciarNuevaCotizacion);
elementos.btnLastQuote.addEventListener("click", () => mostrarCotizacionFinal(estado.ultimaCotizacion));

elementos.modalOverlay.addEventListener("click", () => {
  if (elementos.serviceModal.classList.contains("is-open")) {
    cerrarModalServicios();
  }

  if (elementos.quoteDrawer.classList.contains("is-open")) {
    cerrarDrawer();
  }
});

window.addEventListener("resize", () => actualizarCarousel(false));

document.addEventListener("keydown", (evento) => {
  if (evento.key !== "Escape") {
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

cargarCatalogo();
