from django.urls import path
from .views import UploadBibliographyView, UserBibliographiesListView, RetrieveTreeView

urlpatterns = [
    path("upload/", UploadBibliographyView.as_view(), name="upload-bib"),
    path("my-list/", UserBibliographiesListView.as_view(), name="my-bibs"),
    path("tree/<id>/", RetrieveTreeView.as_view(), name="retrieve-tree"),
]
