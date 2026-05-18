from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('vossai_app.urls')),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='frontend'),
]

# Explicitly define error handlers to avoid inspection recursion
handler400 = 'django.views.defaults.bad_request'
handler403 = 'django.views.defaults.permission_denied'
handler404 = 'django.views.defaults.page_not_found'
handler500 = 'django.views.defaults.server_error'