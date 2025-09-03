from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reports', views.ReportViewSet, basename='report')
router.register(r'claims', views.ClaimViewSet, basename='claim')

urlpatterns = [
    path('', include(router.urls)),
    path('sales/', views.SalesReportView.as_view(), name='sales-report'),
    path('products/', views.ProductReportView.as_view(), name='product-report'),
    path('users/', views.UserReportView.as_view(), name='user-report'),
    path('reviews/', views.ReviewsReportView.as_view(), name='reviews-report'),
    path('claims-report/', views.ClaimsReportView.as_view(), name='claims-report'),
    path('dashboard/', views.DashboardReportView.as_view(), name='dashboard-report'),
]
