from django.shortcuts import render
from authentication.models import User
from authentication.serializers import UserSerializer
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.urls import path

# Home Page View
def home(request):
    return HttpResponse("<h1>Welcome to NariDhan!</h1><p>Please visit <a href='/api/auth/login/'>Login</a> or <a href='/api/auth/register/'>Register</a>.</p>")

# User Registration View
class UserRegistrationView(APIView):
    def post(self, request):
        data = request.data.copy()  # Get request data
        # You can keep or remove this line based on how you pass data
        data['username'] = data.get('name', data.get('username', ''))  # Adjust to use 'username' if 'name' is not present
        serializer = UserSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User Login View
class UserLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        # Allow login using email or username
        user = authenticate(request, username=username, password=password)
        if not user:
            user_model = User.objects.filter(email=username).first()
            if user_model:
                user = authenticate(request, username=user_model.username, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username, 'role': getattr(user, 'role', 'N/A')})
        else:
            return Response({'message': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)

# User Logout View
class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = request.auth
            if token:
                token.delete()  # Delete the token
            logout(request)  # Log out the user
            return Response({
                'status': 'success',
                'message': 'Successfully logged out.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'An error occurred during logout.'
            }, status=status.HTTP_400_BAD_REQUEST)

# URL Patterns
urlpatterns = [
    path('', home, name='home'),  # Home page
    path('api/auth/register/', UserRegistrationView.as_view(), name='user-registration'),
    path('api/auth/login/', UserLoginView.as_view(), name='user-login'),
    path('api/auth/logout/', UserLogoutView.as_view(), name='user-logout'),
]
