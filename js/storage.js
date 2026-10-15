const CLAVE_BORRADOR = "cubiqs-cotizacion-borrador";
const CLAVE_ULTIMA_COTIZACION = "cubiqs-ultima-cotizacion";

function obtenerJSON(clave) {
  const valor = localStorage.getItem(clave);

  if (!valor) {
    return null;
  }

  try {
    return JSON.parse(valor);
  } catch {
    localStorage.removeItem(clave);
    return null;
  }
}

const CubiqsStorage = {
  guardarBorrador(cotizacion) {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(cotizacion));
  },

  obtenerBorrador() {
    return obtenerJSON(CLAVE_BORRADOR);
  },

  eliminarBorrador() {
    localStorage.removeItem(CLAVE_BORRADOR);
  },

  guardarUltimaCotizacion(cotizacion) {
    localStorage.setItem(CLAVE_ULTIMA_COTIZACION, JSON.stringify(cotizacion));
  },

  obtenerUltimaCotizacion() {
    return obtenerJSON(CLAVE_ULTIMA_COTIZACION);
  }
};
