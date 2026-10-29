// Argumentos de Chromium para renderizar WebGL con la GPU real (capturas).
// En Windows usa Direct3D 11; en otros sistemas, OpenGL. Sin GPU disponible, Chromium cae a software.
export const argsGpu = [
  "--enable-gpu",
  "--ignore-gpu-blocklist",
  process.platform === "win32" ? "--use-angle=d3d11" : "--use-angle=gl",
]
