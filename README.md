# Cubiqs | Cotizador de servicios

Proyecto final del curso de JavaScript. Cubiqs es un simulador de cotización de servicios digitales que permite recorrer distintas áreas, seleccionar servicios, modificar cantidades, calcular una estimación y completar el proceso hasta generar una cotización final.

La propuesta no busca resolver solamente el cálculo: también trabaja la experiencia completa de exploración, selección, revisión y contacto posterior.

## Funcionalidades principales

- Catálogo de servicios cargado desde `data/servicios.json` mediante `fetch`.
- Navegación por categorías a través de un carrusel 3D interactivo.
- Apertura de servicios en modal y selección dinámica desde la interfaz.
- Botón flotante de cotización con cantidad de servicios y total actualizado en tiempo real.
- Drawer lateral para revisar, modificar o eliminar servicios sin salir del catálogo.
- Manejo de servicios con cantidad variable, como mantenimientos mensuales.
- Cálculo automático de subtotales y total general.
- Vista de revisión antes de confirmar la cotización.
- Formulario de datos del cliente con validaciones propias.
- Generación de una cotización final con identificador, fecha, servicios seleccionados y total estimado.
- Acceso a la última cotización generada.
- Copia del resumen al portapapeles.
- Continuación por WhatsApp con un mensaje armado automáticamente a partir de la cotización generada.
- Persistencia del borrador y de la última cotización mediante `localStorage`.
- Recuperación del estado cuando el usuario vuelve a ingresar.
- Avisos y confirmaciones mediante SweetAlert2, sin utilizar `alert`, `prompt` ni `confirm` nativos.
- Manejo visual de estados de carga y errores del catálogo.
- Interfaz responsive para desktop, tablet y mobile.

## Interfaz

La interfaz fue desarrollada con CSS propio, sin frameworks visuales.

Entre los recursos utilizados se encuentran:

- Carrusel de categorías con profundidad, escala, rotación y desplazamiento en 3D.
- Componentes con estética neumórfica.
- Superficies y paneles tipo Liquid Glass con `backdrop-filter` y filtros SVG.
- Iconografía construida con SVG inline.
- Botones y controles con estados visuales propios.
- Botón flotante para acceder a la cotización.
- Drawer lateral de cotización en desktop.
- Adaptación del modal y de los controles para pantallas táctiles y resoluciones pequeñas.
- Animaciones y transiciones aplicadas a vistas, cards, paneles y controles.

## JavaScript aplicado

El proyecto utiliza JavaScript Vanilla para manejar el estado y toda la interacción de la aplicación.

Se implementan, entre otros conceptos del curso:

- Manipulación dinámica del DOM.
- Eventos de usuario.
- Arrays y objetos.
- Métodos de orden superior como `map`, `filter`, `reduce`, `find`, `some` y `forEach`.
- Destructuring, operadores ternarios y operadores lógicos.
- `localStorage` para guardar, recuperar, modificar y eliminar información.
- `fetch` para consumir el archivo JSON local.
- `async` / `await`.
- Manejo de errores con `try`, `catch` y `finally`.
- SweetAlert2 como librería externa para avisos y confirmaciones.
- Clipboard API para copiar el resumen de la cotización.
- Generación dinámica del enlace y mensaje de WhatsApp.

## Flujo del simulador

```text
Explorar categorías
        ↓
Seleccionar servicios
        ↓
Revisar la cotización
        ↓
Modificar cantidades o servicios
        ↓
Completar datos del cliente
        ↓
Confirmar
        ↓
Generar cotización final
        ↓
Copiar resumen o continuar por WhatsApp
```

## Tecnologías

- HTML5
- CSS3
- JavaScript Vanilla
- JSON
- Fetch API
- LocalStorage
- SweetAlert2
- SVG
- Clipboard API

## Estructura del proyecto

```text
cubiqs-cotizador/
├── assets/
├── css/
│   └── style.css
├── data/
│   └── servicios.json
├── js/
│   ├── app.js
│   └── storage.js
├── index.html
└── README.md
```

## Uso local

El catálogo se carga mediante `fetch`, por lo que el proyecto debe ejecutarse desde un servidor local.

Una forma simple de hacerlo es:

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Ejecutar `index.html` con Live Server.
3. Navegar la aplicación desde la dirección local generada por la extensión.

No requiere instalación de dependencias. SweetAlert2 se carga desde CDN.

## Demo

- Web: https://pipevibez.github.io/cubiqs-cotizador/index.html
- Repositorio: https://github.com/pipevibez/cubiqs-cotizador

---

**Andrés Felipe Villarreal**
