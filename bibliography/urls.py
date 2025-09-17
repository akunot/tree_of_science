from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.bibliography_list, name='bibliography_list'),
    path('upload/', views.bibliography_upload, name='bibliography_upload'),
    path('download/<int:pk>/', views.bibliography_download, name='bibliography_download'),
    path('delete/<int:pk>/', views.bibliography_delete, name='bibliography_delete'),
]
