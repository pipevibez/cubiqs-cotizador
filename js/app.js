const RUTA_CATALOGO = "./data/servicios.json";

const estado = {
  categorias: [],
  servicios: [],
  cargando: false
};

const elementos = {
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  categoryGrid: document.querySelector("#category-grid"),
  btnRetry: document.querySelector("#btn-retry")
};

function escaparHTML(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
    .map(({ nombre, descripcion, icono }) => `
      <article class="category-card" role="listitem">
        <span class="category-icon">${obtenerIconoCategoria(icono)}</span>
        <h2>${escaparHTML(nombre)}</h2>
        <p>${escaparHTML(descripcion)}</p>
      </article>
    `)
    .join("");
}

async function cargarCatalogo() {
  estado.cargando = true;
  elementos.loadingState.hidden = false;
  elementos.errorState.hidden = true;
  elementos.categoryGrid.hidden = true;

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
    elementos.categoryGrid.hidden = false;
  } catch (error) {
    elementos.errorState.hidden = false;
  } finally {
    estado.cargando = false;
    elementos.loadingState.hidden = true;
  }
}

elementos.btnRetry.addEventListener("click", cargarCatalogo);

cargarCatalogo();
