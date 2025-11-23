from django.urls import path
from Authentication.Views import views_login

urlpatterns = [
    path('', views_login.signin_view, name='signin'),
    path('signup/', views_login.signup_view, name='signup'),
    path('logout/', views_login.logout_view, name='logout'),
    path('reset/request/', views_login.request_reset_view, name='password_reset_custom'),
    path('reset/code/', views_login.verify_code_view, name='verify_code'),
    path('reset/new/', views_login.set_new_password_view, name='set_new_password'),
    path('editar_perfil/', views_login.editar_perfil, name='editar_perfil'),

]
