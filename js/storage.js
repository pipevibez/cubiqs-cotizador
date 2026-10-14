const CLAVE_BORRADOR = "cubiqs-cotizacion-borrador";

const CubiqsStorage = {
  guardarBorrador(cotizacion) {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(cotizacion));
  },

  obtenerBorrador() {
    const borrador = localStorage.getItem(CLAVE_BORRADOR);

    if (!borrador) {
      return null;
    }

    try {
      return JSON.parse(borrador);
    } catch {
      localStorage.removeItem(CLAVE_BORRADOR);
      return null;
    }
  },

  eliminarBorrador() {
    localStorage.removeItem(CLAVE_BORRADOR);
  }
};
