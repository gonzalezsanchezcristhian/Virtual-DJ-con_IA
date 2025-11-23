from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.conf import settings
from dotenv import load_dotenv
from django.utils import timezone
from .models import EmocionDetectada
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
import requests
import random

load_dotenv()
# =============================
# 🧠 Vistas de la app
# =============================
@login_required
def app_view(request):
    """Vista principal de la aplicación."""
    return render(request, 'core/Assessment/app.html')


@login_required
def detectar_emocion_view(request):
    """Vista de detección de emociones."""
    return render(request, 'core/Assessment/emocion.html')


# =============================
# 🎧 OBTENER TOKEN CLIENTE DE SPOTIFY
# =============================
def obtener_token_spotify():
    """Obtiene un token válido desde Spotify (Client Credentials Flow)."""
    url = "https://accounts.spotify.com/api/token"
    data = {"grant_type": "client_credentials"}
    auth = (settings.SPOTIFY_CLIENT_ID, settings.SPOTIFY_CLIENT_SECRET)

    response = requests.post(url, data=data, auth=auth)
    if response.status_code == 200:
        token = response.json().get("access_token")
        return token
    else:
        print("❌ Error al obtener token Spotify:", response.text)
        return None

# =============================
# 🎵 PLAYLISTS SEGÚN EMOCIÓN (REAL)
# =============================
def spotify_playlists(request, mood):
    token = obtener_token_spotify()
    if not token:
        print("⚠️ No se pudo obtener token de Spotify")
        return JsonResponse({"error": "No se pudo obtener token"}, status=500)
    # Varias consultas posibles por emoción para aumentar variedad
    queries_map = {
        "happy": [
            "happy upbeat mood",
            "feel good hits",
            "sunny upbeat playlist",
            "pop happy songs",
        ],
        "sad": [
            "sad emotional songs",
            "melancholic ballads",
            "sad piano",
            "tearjerker playlist",
        ],
        "angry": [
            "angry rock workout",
            "heavy metal rage",
            "intense gym rock",
        ],
        "neutral": [
            "chill focus background",
            "lofi study beats",
            "ambient chill",
        ],
        "fearful": [
            "relax calm",
            "soothing ambient",
            "calming music",
        ],
        "surprised": [
            "party hits",
            "fresh new hits",
            "surprising pop",
        ],
        "disgusted": [
            "lofi beats chillhop",
            "alternative indie",
            "experimental music",
        ],
    }

    query_list = queries_map.get(mood.lower(), ["mood music", "popular playlists"])
    query = random.choice(query_list)

    # offset aleatorio para paginar resultados y obtener variación
    offset = random.randint(0, 40)

    url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"q": query, "type": "playlist", "limit": 8, "offset": offset}

    print(f"🔍 Solicitando playlists para {mood}: query='{query}' offset={offset}")
    response = requests.get(url, headers=headers, params=params)
    print("🧠 Respuesta Spotify:", response.status_code)

    if response.status_code != 200:
        print("❌ Error Spotify:", response.text)
        return JsonResponse({"error": "No se pudo conectar con Spotify"}, status=500)

    data = response.json()

    playlists = []
    for p in data.get("playlists", {}).get("items", []):
        if not p:
            continue
        titulo = p.get("name", "Sin título")
        artista = (p.get("owner") or {}).get("display_name", "Desconocido")
        portada = ""
        if p.get("images") and len(p["images"]) > 0:
            portada = p["images"][0].get("url", "")
        link = (p.get("external_urls") or {}).get("spotify", "#")

        playlists.append({
            "titulo": titulo,
            "artista": artista,
            "portada": portada,
            "link": link
        })

    # Mezclar para mayor variedad de orden
    random.shuffle(playlists)

    if not playlists:
        return JsonResponse({"error": "No se encontraron playlists válidas"}, status=404)

    print(f"🎵 {len(playlists)} playlists obtenidas correctamente para '{mood}' (query='{query}' offset={offset})")
    # Devolver también la query y offset usados para debug y trazabilidad
    return JsonResponse({"playlists": playlists, "query": query, "offset": offset})


# =============================
# 🔐 LOGIN SPOTIFY (para reproducción)
# =============================
def spotify_login(request):
    from urllib.parse import urlencode

    scope = "user-read-playback-state user-modify-playback-state streaming"
    params = {
        "client_id": settings.SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
        "scope": scope,
        # Fuerza a Spotify a mostrar el diálogo de consentimiento aunque ya haya autorizado
        "show_dialog": "true",
    }
    auth_url = "https://accounts.spotify.com/authorize?" + urlencode(params)
    return redirect(auth_url)
# =============================
# 🔄 CALLBACK DESPUÉS DEL LOGIN
# =============================
def spotify_callback(request):
    code = request.GET.get('code')
    token_url = "https://accounts.spotify.com/api/token"

    response = requests.post(token_url, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': settings.SPOTIFY_REDIRECT_URI,
        'client_id': settings.SPOTIFY_CLIENT_ID,
        'client_secret': settings.SPOTIFY_CLIENT_SECRET
    })

    tokens = response.json()
    access_token = tokens.get('access_token')
    if not access_token:
        print("⚠️ Error al obtener token:", tokens)
        return JsonResponse({'error': 'No se pudo autenticar con Spotify'}, status=400)

    # Guardar token en sesión y guardar refresh token si viene
    request.session['spotify_token'] = access_token
    refresh_token = tokens.get('refresh_token')
    if refresh_token:
        request.session['spotify_refresh_token'] = refresh_token
    # También guardar expires_in si viene
    expires_in = tokens.get('expires_in')
    if expires_in:
        request.session['spotify_token_expires_in'] = expires_in

    print("✅ Token guardado correctamente en sesión")
    print("tokens (debug):", {k: v for k, v in tokens.items() if k != 'access_token'})

    # Llamar a /v1/me para comprobar el tipo de cuenta (premium/free) y scopes
    try:
        me_resp = requests.get(
            "https://api.spotify.com/v1/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        print("GET /v1/me status:", me_resp.status_code)
        # Imprimir el body crudo para diagnósticos incluso si no es JSON válido
        print("/v1/me response text:", me_resp.text)
        if me_resp.status_code == 200:
            try:
                me_json = me_resp.json()
                print("/v1/me response:", me_json)
                # Guardar info mínima en sesión
                request.session['spotify_user_id'] = me_json.get('id')
                request.session['spotify_user_product'] = me_json.get('product')
            except Exception as e:
                print("❌ Error parseando JSON de /v1/me:", e)
        else:
            print(f"❌ /v1/me devolvió status {me_resp.status_code}: {me_resp.text}")
    except Exception as e:
        print("❌ Error al solicitar /v1/me:", e)

    # Redirigir a la detección de emociones
    return redirect('/assessment/detectar/')
@login_required
def registrar_emocion(request):
    """Guarda la emoción detectada o escrita en la base de datos.
    Nota: antes estaba marcado con @csrf_exempt; lo quité para usar la protección
    CSRF normal (la petición fetch ya envía la cabecera X-CSRFToken). Además
    añado prints de depuración para verificar usuario, cookies y cuerpo.
    """
    print("--- registrar_emocion invoked ---")
    print("user:", getattr(request, 'user', None))
    try:
        print("user.is_authenticated:", request.user.is_authenticated)
    except Exception:
        print("user.is_authenticated: <no disponible>")
    print("cookies:", request.COOKIES)
    print("method:", request.method)

    if request.method == "POST":
        try:
            body = request.body.decode('utf-8') if isinstance(request.body, (bytes, bytearray)) else request.body
            print("raw body:", body)
            data = json.loads(body)
            emocion = data.get("emocion")

            if not emocion:
                return JsonResponse({"success": False, "message": "No se recibió la emoción"})
            EmocionDetectada.objects.create(
                usuario=request.user,
                emocion=emocion,
                fecha=timezone.now()
            )
            print(f"✅ Emoción '{emocion}' registrada para {request.user.username}")
            return JsonResponse({"success": True, "message": "Emoción registrada correctamente"})
        except Exception as e:
            print("❌ Error al registrar emoción:", e)
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "message": "Método no permitido"})

@login_required
def historial_emociones(request):
    """Genera estadísticas por emoción y muestra el historial."""
    emociones = EmocionDetectada.objects.filter(usuario=request.user).order_by('-fecha')
    # Agrupar por emoción
    data_emociones = {}
    for e in emociones:
        data_emociones[e.emocion] = data_emociones.get(e.emocion, 0) + 1

    context = {
        # Pasar JSON serializado para que Chart.js reciba arrays JS válidos
        "labels": json.dumps(list(data_emociones.keys()), ensure_ascii=False),
        "values": json.dumps(list(data_emociones.values())),
        "historial": emociones,
    }
    return render(request, "core/Assessment/historial.html", context)