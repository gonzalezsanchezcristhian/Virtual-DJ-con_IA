const video = document.getElementById('video');
const btnDetectar = document.getElementById('btnDetectar');
const resultado = document.getElementById('resultado');
const mensaje = document.getElementById('mensaje');
const btnReproducir = document.getElementById('btnReproducir');

// Carga los modelos de detección
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/static/models')
]).then(() => {
  console.log("Modelos cargados correctamente ✅");
});

btnDetectar.addEventListener('click', async () => {
  // Acceder a la cámara
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  mensaje.textContent = "Detectando emoción... 😶";
  btnDetectar.style.display = "none";

  // Esperar un momento a que el video inicie
  video.addEventListener('playing', () => {
    detectarEmocion();
  });
});

async function detectarEmocion() {
  const deteccion = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  if (deteccion && deteccion.expressions) {
    const emociones = deteccion.expressions;
    const emocion = Object.keys(emociones).reduce((a, b) => emociones[a] > emociones[b] ? a : b);

    resultado.textContent = `Emoción detectada: ${emocion.toUpperCase()} 😄`;
    btnReproducir.style.display = "block";
    mensaje.textContent = "¡Listo! Ya puedo recomendarte música 🎶";
  } else {
    resultado.textContent = "No se detectó ningún rostro 😕";
    setTimeout(detectarEmocion, 1500); // Reintentar
  }
}
