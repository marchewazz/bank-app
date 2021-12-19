from django.urls import path

from . import views

urlpatterns = [
    path("add", views.addBill, name='addBill'),
    path("test", views.test, name='addBill'),
]
