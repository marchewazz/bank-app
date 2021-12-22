from django.urls import path

from . import views

urlpatterns = [
    path('register', views.register, name='register'),
    path('login', views.login, name='login'),
    path('pinemail', views.validatePINByEmail, name='pin'),
    path('pinnumber', views.validatePINByAccNumber, name='pin'),
    path('refresh', views.refreshUserData, name='refresh'),
]
