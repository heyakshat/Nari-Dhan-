from django.contrib import admin
from django.urls import path, include
from authentication.views import UserRegistrationView, UserLoginView, UserLogoutView
from django.http import HttpResponseRedirect
from django.urls import path
from authentication.views import UserRegistrationView, UserLoginView, UserLogoutView

urlpatterns = [
    path('', lambda request: HttpResponseRedirect('/api/auth/login/')),  # Redirect root URL to login
    path('api/auth/register/', UserRegistrationView.as_view(), name='user-registration'),
    path('api/auth/login/', UserLoginView.as_view(), name='user-login'),
    path('api/auth/logout/', UserLogoutView.as_view(), name='user-logout'),
]

