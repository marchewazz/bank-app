from django.urls import path

from . import views

urlpatterns = [
    path('register', views.register, name='register'),
    path('login', views.login, name='login'),
    path('pin', views.validatePIN, name='pin'),
    path('refresh', views.refreshUserData, name='refresh'),
]
