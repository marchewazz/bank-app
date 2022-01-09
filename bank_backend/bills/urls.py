from django.urls import path

from . import views

urlpatterns = [
    path("addown", views.addBill, name='addBill'),
    path("deleteown", views.deleteBill, name='addBill'),
    path("getall", views.getBills, name='getBills'),
    path("getonebill", views.getOneBill, name='getOneBills')
]
