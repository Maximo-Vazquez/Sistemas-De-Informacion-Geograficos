// Envía un formulario nativo DESPUÉS de que el navegador pinte el estado de "enviando".
// Si el POST sale en el mismo evento del clic, la navegación empieza antes de que React dibuje el
// progreso y el usuario no ve nada. `form.submit()` no vuelve a disparar `onSubmit`, así que el
// contrato con Django (mismo action, method y campos) no cambia.
export function submitAfterPaint(form: HTMLFormElement | null) {
  if (!form) return
  requestAnimationFrame(() => requestAnimationFrame(() => form.submit()))
}
