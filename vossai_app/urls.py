from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='name'),
    path('tasks/', views.task_list, name='task_list'),
    path('tasks/<str:pk>/', views.task_detail, name='task_detail'),
]