# Assessment/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.app_view, name='assessment_app'),
    path('detectar/', views.detectar_emocion_view, name='detectar'),
    path('spotify/login/', views.spotify_login, name='spotify_login'),
    path('spotify/callback/', views.spotify_callback, name='spotify_callback'),
    path('spotify/<str:mood>/', views.spotify_playlists, name='spotify_playlists'),
    path('registrar_emocion/', views.registrar_emocion, name='registrar_emocion'),
    path('historial/', views.historial_emociones, name='historial_emociones'),
]

