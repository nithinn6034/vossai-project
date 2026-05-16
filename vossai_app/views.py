from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Task


# ─── HELPER ───────────────────────────────────────────
def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
    }


# ─── REGISTER ─────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    if request.method == 'POST':
        name     = request.data.get('name')
        email    = request.data.get('email')
        password = request.data.get('password')

        if not name or not email or not password:
            return Response({'error': 'All fields are required'}, status=400)

        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=400)

        user = User.objects.create_user(
            name=name,
            email=email,
            password=password
        )

        return Response({'message': 'Registration successful'}, status=201)


# ─── LOGIN ────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    if request.method == 'POST':
        email    = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or password'}, status=401)

        if not user.check_password(password):
            return Response({'error': 'Invalid email or password'}, status=401)

        tokens = get_tokens(user)
        return Response({
            'message': 'Login successful',
            'access':  tokens['access'],
            'refresh': tokens['refresh'],
            'name':    user.name,
            'email':   user.email,
        })


# ─── TASKS LIST & CREATE ──────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list(request):

    if request.method == 'GET':
        status_filter = request.query_params.get('status', None)
        tasks = Task.objects.filter(user=request.user)

        if status_filter:
            tasks = tasks.filter(status=status_filter)

        data = list(tasks.values(
            'id', 'title', 'description', 'status', 'due_date'
        ))
        return Response(data)

    if request.method == 'POST':
        title       = request.data.get('title')
        description = request.data.get('description', '')
        status      = request.data.get('status', 'Pending')
        due_date    = request.data.get('due_date', None)

        if not title:
            return Response({'error': 'Title is required'}, status=400)

        task = Task(
            title=title,
            description=description,
            status=status,
            due_date=due_date if due_date else None,
            user=request.user
        )
        task.save()

        return Response({'message': 'Task created successfully', 'id': task.id}, status=201)


# ─── TASK UPDATE & DELETE ─────────────────────────────
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):

    try:
        task = Task.objects.get(id=pk, user=request.user)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)

    if request.method == 'PUT':
        task.title       = request.data.get('title',       task.title)
        task.description = request.data.get('description', task.description)
        task.status      = request.data.get('status',      task.status)
        task.due_date    = request.data.get('due_date',    task.due_date)
        task.save()

        return Response({'message': 'Task updated successfully'})

    if request.method == 'DELETE':
        task.delete()
        return Response({'message': 'Task deleted successfully'})