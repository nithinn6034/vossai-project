from django.urls import path
from vossai_app import views

urlpatterns = [

    # Auth
    path('api/register', views.register, name='register'),
    path('api/login', views.login, name='login'),

    # Tasks
    path('api/tasks', views.task_list, name='task_list'),
    path('api/tasks/<int:pk>/', views.task_detail, name='task_detail'),

]