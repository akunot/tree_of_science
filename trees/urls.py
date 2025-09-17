from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.tree_generate, name='tree_generate'),
    path('history/', views.tree_history, name='tree_history'),
    path('<int:pk>/', views.tree_detail, name='tree_detail'),
    path('<int:pk>/download/<str:format_type>/', views.tree_download, name='tree_download'),
    path('<int:pk>/delete/', views.tree_delete, name='tree_delete'),
]