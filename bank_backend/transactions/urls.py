from django.urls import path

from . import views

urlpatterns = [
    path("transfer", views.transferMoney, name='transferMoney'),
    path("historyaccount", views.getHistoryByAccount, name='history'),
    path("historybill", views.getHistoryByBill, name='history'),
]