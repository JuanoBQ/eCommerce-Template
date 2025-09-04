from django.urls import path
from . import views

app_name = 'admin'

urlpatterns = [
    path('settings/', views.admin_settings_view, name='admin-settings'),
    path('settings/reset/', views.reset_admin_settings_view, name='admin-settings-reset'),
    path('stats/', views.admin_stats_view, name='admin-stats'),
]
