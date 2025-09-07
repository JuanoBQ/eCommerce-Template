from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_report, name='dashboard-report'),
    path('reviews/', views.reviews_report, name='reviews-report'),
    path('claims/', views.claims_list, name='claims-list'),
    path('claims/<int:claim_id>/', views.claim_detail, name='claim-detail'),
    path('claims/create/', views.create_claim, name='create-claim'),
    path('claims/<int:claim_id>/update/', views.update_claim, name='update-claim'),
    path('claims/<int:claim_id>/delete/', views.delete_claim, name='delete-claim'),
    path('claims/<int:claim_id>/add_message/', views.add_claim_message, name='add-claim-message'),
]