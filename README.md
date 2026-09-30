# GuíaLab v13 + Desafío GuíaLab

La guía y el desafío comparten el archivo `determinaciones.json`.

## Utilidades

La pantalla principal incorpora una calculadora de diluciones generales (`C₁ × V₁ = C₂ × V₂`) y una tabla para diluciones seriadas. Los volúmenes se pueden expresar en µL, mL o L. Para concentraciones, C₁ y C₂ deben ingresarse en la misma unidad.

## Contador de visitas

El pie de página utiliza CounterAPI, un contador público alojado externamente y sin configuración, para guardar el total fuera del navegador. Cuenta visitas únicas de forma aproximada a partir de identificadores anonimizados del servicio; no usa `localStorage` ni incrementa un número local al iniciar sesión. Al ser un servicio público de terceros, el contador requiere conexión y puede no mostrarse si la red o un bloqueador de contenido impiden cargarlo. No debe interpretarse como una métrica analítica certificada.
