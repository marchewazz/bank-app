from django.urls import path

from . import views

urlpatterns = [
    path("addown", views.addBill, name='addBill'),
    path("deleteown", views.deleteBill, name='addBill'),
    path("getall", views.getBills, name='getBills'),
    path("getfavorite", views.getFavoriteBills, name='getFavoriteBills'),
    path("getonebill", views.getOneBill, name='getOneBills'),
    path("addfavorite", views.addFavoriteBill, name='addFavoriteBill'),
    path("updatefavoritename", views.updateFavoriteName, name='addFavoriteBill'),
    path("deletefavoritebill", views.deleteFavorite, name='deleteFavoriteBill'),
]
