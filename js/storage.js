const CubiqsStorage = (() => {
  const CLAVE_BORRADOR = "cubiqs_cotizacion_borrador";
  const CLAVE_ULTIMA_COTIZACION = "cubiqs_ultima_cotizacion";
  const CLAVE_VISTA = "cubiqs_estado_vista";

  function leerJSON(clave, fallback = null) {
    try {
      const valor = localStorage.getItem(clave);
      return valor ? JSON.parse(valor) : fallback;
    } catch (error) {
      localStorage.removeItem(clave);
      return fallback;
    }
  }

  function guardarBorrador(borrador) {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(borrador));
  }

  function obtenerBorrador() {
    return leerJSON(CLAVE_BORRADOR, null);
  }

  function eliminarBorrador() {
    localStorage.removeItem(CLAVE_BORRADOR);
  }

  function guardarUltimaCotizacion(cotizacion) {
    localStorage.setItem(CLAVE_ULTIMA_COTIZACION, JSON.stringify(cotizacion));
  }

  function obtenerUltimaCotizacion() {
    return leerJSON(CLAVE_ULTIMA_COTIZACION, null);
  }

  function guardarVista(vista) {
    localStorage.setItem(CLAVE_VISTA, vista);
  }

  function obtenerVista() {
    return localStorage.getItem(CLAVE_VISTA) || "catalogo";
  }

  function vaciarEstadoTemporal() {
    localStorage.removeItem(CLAVE_BORRADOR);
    localStorage.removeItem(CLAVE_VISTA);
  }

  return {
    guardarBorrador,
    obtenerBorrador,
    eliminarBorrador,
    guardarUltimaCotizacion,
    obtenerUltimaCotizacion,
    guardarVista,
    obtenerVista,
    vaciarEstadoTemporal
  };
})();
