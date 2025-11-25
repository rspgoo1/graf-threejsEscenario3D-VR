# graf-threejsEscenario3D-VR
# 🫧 OXYVERSE VR

<div align="center">
  
  ![Oxyverse VR Banner](https://img.shields.io/badge/VR-Experience-00E5FF?style=for-the-badge&logo=virtual-reality&logoColor=white)
  ![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
  ![WebXR](https://img.shields.io/badge/WebXR-Enabled-00C9A7?style=for-the-badge)
  
  ### Experiencia Virtual de una Fábrica de Oxigenación
  
  *Una aplicación de Realidad Virtual interactiva desarrollada con Three.js, WebXR y Cannon.js*
  
  [🎮 Demo en Vivo](#) • [📖 Documentación](#características) • [🐛 Reportar Bug](https://github.com/tu-usuario/oxyverse-vr/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Controles VR](#-controles-vr)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrolladores](#-desarrolladores)
- [Licencia](#-licencia)

---

## 🎯 Descripción

**Oxyverse VR** es una experiencia de realidad virtual inmersiva que simula el interior de una planta industrial de oxigenación. Los usuarios pueden explorar diferentes equipos y maquinaria, interactuar con objetos mediante raycast, y aprender sobre los procesos industriales de producción de oxígeno a través de audios informativos.

Este proyecto fue desarrollado como parte de la **Actividad 3.7: Desarrollo de Escenarios VR** utilizando tecnologías web modernas para crear una experiencia educativa e interactiva completamente funcional en navegadores compatibles con WebXR.

---

## ✨ Características

- 🥽 **Experiencia VR Completa**: Compatible con visores Meta Quest 2/3, HTC Vive y otros dispositivos WebXR
- 🎮 **Controles Intuitivos**: Movimiento con joystick izquierdo, rotación con joystick derecho
- 🔦 **Sistema de Raycast**: Apunta a objetos para obtener información en tiempo real
- 🎵 **Audio Interactivo**: Cada equipo reproduce información al ser señalado
- ⚙️ **Física Realista**: Sistema de colisiones con Cannon.js
- 🏭 **Modelos 3D Detallados**: 
  - Planta de oxigenación completa
  - Montacargas (Forklift)
  - Robot industrial
  - Generador eléctrico (Power Plant)
  - Estantería de almacén
  - Múltiples equipos industriales (Cold Box, Air Compressor, etc.)
- 🌅 **Iluminación HDR**: Ambiente realista con mapas HDRI

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Three.js** | 0.164.1 | Motor gráfico 3D |
| **WebXR** | Latest | API de Realidad Virtual |
| **Cannon.js** | 0.20.0 | Motor de física |
| **GLTF/GLB** | 2.0 | Formato de modelos 3D |
| **Draco Loader** | Latest | Compresión de geometría |
| **OrbitControls** | Three.js | Navegación en modo desktop |

---

## 🚀 Instalación

### Requisitos Previos

- Navegador compatible con WebXR (Chrome, Edge, Firefox Reality)
- Dispositivo VR compatible (Meta Quest, HTC Vive, etc.)
- Servidor web local (para desarrollo)

### Pasos de Instalación

1. **Clona el repositorio**
```bash
   git clone https://github.com/tu-usuario/oxyverse-vr.git
   cd oxyverse-vr
```

2. **Instala un servidor local** (elige uno):
```bash
   # Opción 1: Python
   python -m http.server 5500
   
   # Opción 2: Node.js (http-server)
   npx http-server -p 5500
   
   # Opción 3: VS Code Live Server
   # Instala la extensión "Live Server" y haz clic derecho > "Open with Live Server"
```

3. **Abre en el navegador**
```
   http://localhost:5500/inicio.html
```

4. **Conecta tu visor VR** y haz clic en "Iniciar Experiencia VR"

---

## 🎮 Controles VR

### Controles de Movimiento

| Control | Acción |
|---------|--------|
| **Joystick Izquierdo** | Mover hacia adelante/atrás/izquierda/derecha |
| **Joystick Derecho (Horizontal)** | Girar 45° izquierda/derecha |
| **Gatillo Derecho** | Activar/Desactivar Raycast |
| **Apuntar con Raycast** | Ver información de equipos (reproduce audio) |

### Controles Desktop (Modo Desarrollo)

- **Mouse**: Mirar alrededor
- **Scroll**: Zoom
- **Click + Arrastrar**: Orbitar cámara

---

## 📁 Estructura del Proyecto
```
GRAF-THREEJSESCENARIO3D+VR/
│
├── index.html                           # Aplicación VR principal con loader
├── indexInicio.html                     # Página de bienvenida
├── main.js                              # Lógica principal de la aplicación VR
│
└── assets/                              # Recursos del proyecto
│
├── Forklift.glb                     # Modelo 3D: Montacargas
├── industrial_robot.glb             # Modelo 3D: Robot industrial
├── industrial_sunset_puresky_1k.hdr # Mapa HDRI para iluminación
├── Oxygenation.glb                  # Modelo 3D: Planta de oxigenación (visual)
├── Oxygenation_Collidors.glb        # Modelo 3D: Colisiones de la planta
├── Power_Plant.glb                  # Modelo 3D: Generador eléctrico
├── Warehouse_Shelving_Unit.glb      # Modelo 3D: Estantería de almacén
│
├── Audio/                           # Archivos de audio
│   ├── After_Cooler.mp3
│   ├── Air_Compressor.mp3
│   ├── Air_Expander.mp3
│   ├── Air_Filter.mp3
│   ├── Carbon_Dioxide_Drying_Unit.mp3
│   ├── Cold_Box.mp3
│   ├── Cylinder_Filling_Ramp.mp3
│   ├── Forklift.mp3
│   ├── Freon_Cooler.mp3
│   ├── Industrial_Robot.mp3
│   ├── Liquid_Oxygen_Pump.mp3
│   ├── Moisture_Absorber.mp3
│   ├── Nitrogen_Cooler.mp3
│   ├── Oil_Absorber.mp3
│   ├── Power_Plant.mp3
│   ├── Purger.mp3
│   ├── Regeneration_Heater.mp3
│   └── Warehouse_Shelving_Unit.mp3
│
└── Images/                          # Recursos gráficos
└── Icon.png                     # Ícono de la aplicación
```
---

## 👥 Desarrolladores

Este proyecto fue desarrollado por estudiantes del **Tecnológico Nacional de México** como parte de la materia de Realidad Virtual:

| Nombre | Matrícula | GitHub |
|--------|-----------|--------|
| **Aguilar Pérez Nahum** | 23200135 | [@usuario1](#) |
| **Contla Martínez Kevin Bertín** | 23200139 | [@usuario2](#) |
| **Olvera Jiménez Ronaldo** | 23200151 | [@usuario3](#) |
| **Santiago Padilla Rubén** | 23200158 | [@usuario4](#) |

---

## 📝 Actividad Académica

**📚 Actividad 3.7: Desarrollo de Escenarios VR**  
**🏫 Institución**: Tecnológico Nacional de México  
**📅 Fecha**: 2025  
**👨‍🏫 Materia**: Realidad Virtual

---

## 🔧 Características Técnicas

### Sistema de Colisiones
- Motor de física Cannon.js para detección de colisiones
- Colliders personalizados para cada objeto
- Cápsula de colisión para el jugador con damping 0.95

### Optimizaciones
- Carga asíncrona de modelos con LoadingManager
- Compresión Draco para geometrías
- Colliders manuales optimizados
- Debug mode toggleable para desarrollo

### Audio Espacial
- Sistema de audio 3D con THREE.Audio
- Reproducción automática al apuntar objetos
- Control de volumen y loops

---

## 🐛 Problemas Conocidos

- [ ] En algunos navegadores móviles, el audio puede no reproducirse automáticamente
- [ ] La carga inicial puede ser lenta en conexiones lentas
- [ ] Requiere HTTPS para funcionar en producción (requisito de WebXR)

---

## 🚀 Roadmap

- [ ] Añadir más equipos industriales
- [ ] Sistema de inventario
- [ ] Modo multijugador
- [ ] Traducciones (ES/EN)
- [ ] Optimización para Quest 2 standalone
- [ ] Tutorial interactivo inicial

---

## 📄 Licencia

Este proyecto es de uso académico. Todos los derechos reservados © 2025

---

## 🙏 Agradecimientos

- **Three.js Team** - Por el increíble motor gráfico
- **Khronos Group** - Por el estándar WebXR
- **Sketchfab Community** - Por los modelos 3D base

---

<div align="center">
  
  ### ⭐ Si te gustó este proyecto, dale una estrella!  
</div>
