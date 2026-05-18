from django.contrib import admin
from django.urls import path, include, re_path
from django.http import FileResponse
from django.conf import settings
import os

def frontend(request):
    index_path = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')
    return FileResponse(open(index_path, 'rb'), content_type='text/html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('vossai_app.urls')),
    re_path(r'^.*$', frontend),
]