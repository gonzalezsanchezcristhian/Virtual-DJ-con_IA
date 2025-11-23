// =============================
// 🎭 Detección de Emociones + Spotify Recomendaciones (con modal)
// =============================

window.addEventListener("DOMContentLoaded", async () => {
  // Verifica si face-api.js está disponible
  if (typeof faceapi === "undefined") {
    console.error("❌ Error: face-api.js no se ha cargado correctamente.");
    return;
  }

  // --- Referencias del DOM ---
  const video = document.getElementById("video");
  const btnDetectar = document.getElementById("btnDetectar");
  const resultado = document.getElementById("resultado");
  const mensaje = document.getElementById("mensaje");
  const btnReproducir = document.getElementById("btnReproducir");

  const modal = document.getElementById("modalPlaylist");
  const playlistContainer = document.getElementById("playlistContainer");

  // Helper: obtener cookie por nombre (necesario para CSRF en fetch)
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // =============================
  // 📦 CARGAR MODELOS DE FACEAPI
  // =============================
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/static/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/static/models"),
    ]);
    console.log("✅ Modelos de detección cargados correctamente");
  } catch (err) {
    console.error("❌ Error al cargar modelos:", err);
    return;
  }

  // =============================
  // 🎥 ACTIVAR CÁMARA
  // =============================
  btnDetectar.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      video.srcObject = stream;
      mensaje.textContent = "Detectando emoción... 😶";
      btnDetectar.style.display = "none";

      video.addEventListener("playing", () => detectarEmocion());
    } catch (err) {
      alert("⚠️ No se pudo acceder a la cámara. Verifica los permisos.");
      console.error(err);
    }
  });

  // =============================
  // 🤖 DETECTAR EMOCIÓN
  // =============================
  async function detectarEmocion() {
    const deteccion = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (deteccion && deteccion.expressions) {
      const emociones = deteccion.expressions;
      const emocion = Object.keys(emociones).reduce((a, b) =>
        emociones[a] > emociones[b] ? a : b
      );

      console.log("🎭 Emoción detectada:", emocion);
  // Guardar última emoción detectada para reutilizar al pedir otra playlist
  window.__lastEmotion = emocion;
      // 💾 Guardar emoción detectada en el historial (backend)
try {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch("/assessment/registrar_emocion/", {
    method: "POST",
    // Enviar credenciales para que la cookie de sesión llegue al servidor
    credentials: 'same-origin',
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ emocion }),
  });

  const data = await res.json();
  if (data.success) {
    console.log("✅ Emoción registrada correctamente en el historial");
  } else {
    console.warn("⚠️ No se pudo registrar la emoción:", data.message || data.error);
  }
} catch (error) {
  console.error("❌ Error al guardar emoción:", error);
}


      resultado.textContent = `Emoción detectada: ${emocion.toUpperCase()} 😄`;
      mensaje.textContent = "¡Listo! Ya puedo recomendarte música 🎶";
  btnReproducir.style.display = "block";
  // Mostrar botón de volver a detectar
  const _btnVolver = document.getElementById('btnVolverDetectar');
  if (_btnVolver) _btnVolver.style.display = 'inline-block';

      // Mostrar playlist con un clic
      btnReproducir.onclick = () => {
        mostrarPlaylist(emocion);
      };
    } else {
      resultado.textContent = "No se detectó ningún rostro 😕";
      setTimeout(detectarEmocion, 1500);
    }
  }
  // =============================
  // 🎧 MOSTRAR PLAYLIST SEGÚN EMOCIÓN
  // =============================
  async function mostrarPlaylist(emocion) {
    if (!playlistContainer) return;

    try {
      console.log(`🎵 Solicitando playlists para: ${emocion}`);
      // indicar carga en UI
      playlistContainer.innerHTML = `<p>Cargando playlists... 🎧</p>`;
      const response = await fetch(`/assessment/spotify/${emocion}/`);
      const data = await response.json();

      // mostrar info de debug (query/offset) si existe
      const debugEl = document.getElementById("spotify-debug");
      if (debugEl) {
        if (data.query || data.offset !== undefined) {
          debugEl.textContent = `query: ${data.query || '-'} | offset: ${data.offset !== undefined ? data.offset : '-'} `;
        } else {
          debugEl.textContent = "";
        }
      }

      if (data.playlists && data.playlists.length > 0) {
        playlistContainer.innerHTML = `
          <div class="playlist-container">
            <h2 class="playlist-title">Playlist para tu estado: ${emocion.toUpperCase()}</h2>
            <div class="playlist-grid">
              ${data.playlists
                .map(
                  (c) => `
                  <div class="playlist-card" data-link="${c.link}">
                    <img src="${c.portada}" alt="${c.titulo}" class="playlist-img">
                    <div class="playlist-info">
                      <h4>${c.titulo}</h4>
                      <p>${c.artista}</p>
                    </div>
                    <iframe
                      src="https://open.spotify.com/embed/playlist/${extraerIdPlaylist(c.link)}"
                      width="100%"
                      height="80"
                      frameborder="0"
                      allowtransparency="true"
                      allow="encrypted-media"
                      class="spotify-frame">
                    </iframe>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>
        `;

        // ✨ Animación suave de entrada
        document.querySelectorAll(".playlist-card").forEach((card, i) => {
          card.style.opacity = "0";
          setTimeout(() => {
            card.style.transition = "opacity 0.5s ease-in-out";
            card.style.opacity = "1";
          }, i * 120);
        });
        // 🎵 Evento: reproducir playlist al hacer clic
        document.querySelectorAll(".playlist-card").forEach((card) => {
          card.addEventListener("click", async () => {
            const link = card.dataset.link;
            card.classList.add("playing");
            await reproducirPlaylistSpotify(link);
            setTimeout(() => card.classList.remove("playing"), 3000);
          });
        });
      } else {
        playlistContainer.innerHTML = `<p>No se encontraron playlists 😕</p>`;
      }
      modal.style.display = "flex";
    } catch (error) {
      console.error("❌ Error al obtener playlists:", error);
      playlistContainer.innerHTML = `<p>Error al conectar con Spotify 😢</p>`;
      modal.style.display = "flex";
    }
  }
  // =============================
  // 🔒 Función para extraer ID de playlist
  // =============================
  function extraerIdPlaylist(url) {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : "";
  }
  // =============================
  // 🔁 CERRAR MODAL DE PLAYLIST
  // =============================
  if (modal) {
    // Cerrar con botón X
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("cerrar")) {
        modal.style.display = "none";
        reiniciar();
      }
    });
    // Cerrar al hacer clic fuera
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        reiniciar();
      }
    });
    // Cerrar con tecla ESC
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
        reiniciar();
      }
    });
  }
  function reiniciar() {
    resultado.textContent = "";
    mensaje.textContent =
      "Permíteme detectar tu emoción para elegir la música ideal 🎵";
    btnDetectar.style.display = "inline-block";
    btnReproducir.style.display = "none";
    // ocultar botón volver a detectar si existe
    const _btnVolverHide = document.getElementById('btnVolverDetectar');
    if (_btnVolverHide) _btnVolverHide.style.display = 'none';
  }
  // Botón para volver a detectar (muestra/oculta y reutiliza reiniciar)
  const btnVolverDetectar = document.getElementById("btnVolverDetectar");
  if (btnVolverDetectar) {
    // cuando se inicializa la página la dejamos oculta, la mostraremos después de una detección
    btnVolverDetectar.style.display = "none";
    btnVolverDetectar.addEventListener("click", (e) => {
      e.preventDefault();
      reiniciar();
      // asegurar foco en la parte superior y reactivar el botón detectar
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  // Botón 'Otra playlist' dentro del modal
  const btnOtra = document.getElementById("otraPlaylistBtn");
  if (btnOtra) {
    btnOtra.addEventListener("click", (e) => {
      e.preventDefault();
      // Si hay una emoción detectada previamente, pedir nuevas playlists para ella
      const last = window.__lastEmotion || localStorage.getItem('emocion_manual');
      if (!last) return alert('Primero detecta una emoción o escribe una emoción manualmente.');
      mostrarPlaylist(last);
    });
  }
});
// =============================
// 🎧 SPOTIFY WEB PLAYER INTEGRATION
// =============================
 // If backend exposed user product and it's not premium, hide web player and show message
  try {
    if (window.__spotifyUserProduct && window.__spotifyUserProduct !== 'premium') {
      console.warn('Spotify account is not premium:', window.__spotifyUserProduct);
      const playerDiv = document.getElementById("spotify-player");
      if (playerDiv) playerDiv.style.display = "none";
      const errBox = document.getElementById("spotify-error");
      const errText = document.getElementById("spotify-error-text");
      if (errBox && errText) {
        errText.textContent = 'Tu cuenta de Spotify no es Premium: reproducción en el Web Playback SDK no está disponible. Usa el botón de reproducir en las tarjetas (embed) o autoriza otra cuenta Premium.';
        errBox.style.display = 'block';
      }
      // still load SDK but do not attempt playback transfer
    }
  } catch (e) {
    console.error('Error comprobando spotify product:', e);
  }

window.onSpotifyWebPlaybackSDKReady = () => {
  const token = sessionStorage.getItem("spotify_token");
  if (!token) {
    console.warn("⚠️ No hay token de Spotify. Debes iniciar sesión.");
    return;
  }
  const player = new Spotify.Player({
    name: "DJ Virtual AI Player",
    getOAuthToken: (cb) => cb(token),
    volume: 0.6,
  });
  // --- Eventos ---
  // Guardar device_id globalmente para poder transferir la reproducción
  window.__spotifyDeviceId = null;
  player.addListener("ready", ({ device_id }) => {
    console.log("✅ Player listo con ID:", device_id);
    // almacenar device id para usarlo al reproducir playlists
    window.__spotifyDeviceId = device_id;
    document.getElementById("spotify-player").style.display = "block";
    document.getElementById("player-status").textContent =
      "Conectado a Spotify 🎶";
  });
  player.addListener("not_ready", ({ device_id }) => {
    console.warn("⚠️ Player desconectado:", device_id);
  });
  player.connect();
  // --- Controles ---
  document
    .getElementById("pause-btn")
    ?.addEventListener("click", () => player.pause());
  document
    .getElementById("resume-btn")
    ?.addEventListener("click", () => player.resume());
};

// =============================
// ▶️ Reproducir playlist en Spotify
// =============================
async function reproducirPlaylistSpotify(playlistUrl) {
  const token = sessionStorage.getItem("spotify_token");
  if (!token) {
    alert("Debes iniciar sesión en Spotify primero 🎧");
    window.location.href = "/assessment/spotify/login/";
    return;
  }

  const playlistId = playlistUrl.split("playlist/")[1]?.split("?")[0];
  if (!playlistId) return alert("URL inválida de playlist.");
  try {
    // Si tenemos device_id del Web Playback SDK, primero transferimos la reproducción
    const deviceId = window.__spotifyDeviceId || null;
    if (deviceId) {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_ids: [deviceId], play: true }),
      });
    }

    // Llamada para reproducir la playlist en el dispositivo especificado (si se tiene)
    const playUrl = deviceId
      ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
      : "https://api.spotify.com/v1/me/player/play";

    const response = await fetch(playUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: `spotify:playlist:${playlistId}`,
      }),
    });

    if (response.ok) {
      console.log("🎶 Playlist reproduciéndose correctamente");
      // limpiar cualquier error previo
      const errBox = document.getElementById("spotify-error");
      if (errBox) errBox.style.display = "none";
    } else {
      const text = await response.text();
      console.error("❌ Error al reproducir playlist:", text);
      // Mostrar mensaje más claro en la UI
      const errBox = document.getElementById("spotify-error");
      const errText = document.getElementById("spotify-error-text");
      if (errBox && errText) {
        errText.textContent = text || "Error al iniciar reproducción (403).";
        errBox.style.display = "block";
      } else {
        alert("No se pudo iniciar la reproducción en el dispositivo de Spotify. Asegúrate de que tu cuenta Premium esté activa y que el reproductor web esté activo en esta página.");
      }

      // ocultar controles del Web Player para evitar confusión
      const playerDiv = document.getElementById("spotify-player");
      if (playerDiv) playerDiv.style.display = "none";
    }
  } catch (err) {
    console.error("❌ Excepción al reproducir playlist:", err);
    alert("Ocurrió un error al intentar reproducir la playlist. Revisa la consola para más detalles.");
  }
}

// =============================
// ✍️ Modal: Escribir emoción manual
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const btnEscribir = document.getElementById("btnEscribir");
  const modalEscribir = document.getElementById("modalEscribir");
  const cerrarModalEscribir = document.getElementById("cerrarModalEscribir");
  const guardarEmocion = document.getElementById("guardarEmocion");
  const inputEmocion = document.getElementById("inputEmocion");

  if (!btnEscribir) return;

  // Abrir modal
  btnEscribir.addEventListener("click", (e) => {
    e.preventDefault();
    modalEscribir.style.display = "flex";
  });

  // Cerrar modal
  cerrarModalEscribir.addEventListener("click", () => {
    modalEscribir.style.display = "none";
  });

  // Guardar emoción
  guardarEmocion.addEventListener("click", () => {
    const emocion = inputEmocion.value.trim().toLowerCase();
    if (!emocion) {
      alert("Por favor escribe una emoción 😅");
      return;
    }
    localStorage.setItem("emocion_manual", emocion);
    console.log("✅ Emoción escrita:", emocion);
    fetch("/assessment/guardar_emocion_manual/", {
      method: "POST",
      credentials: 'same-origin',
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ emocion }),
    })
      .then(res => res.json())
      .then(data => {
        console.log("💾 Servidor:", data);
        alert(`Emoción "${emocion}" guardada correctamente ✅`);
      })
      .catch(err => console.error("❌ Error:", err));

    modalEscribir.style.display = "none";
    inputEmocion.value = "";
  });

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
});
