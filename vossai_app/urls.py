from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import render

def frontend(request):
    return render(request, 'index.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('vossai_app.urls')),
    re_path(r'^.*$', frontend),
]