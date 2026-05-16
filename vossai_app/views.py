from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from bson import ObjectId
from .models import User


task_collection = settings.MONGO_DB['tasks']



def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
    }



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

        user = User.objects.create_user(name=name, email=email, password=password)
        return Response({'message': 'Registration successful'}, status=201)



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



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list(request):

    if request.method == 'GET':
        status_filter = request.query_params.get('status', None)
        query = {'user_id': str(request.user.id)}

        if status_filter:
            query['status'] = status_filter

        tasks = list(task_collection.find(query))
        for task in tasks:
            task['id']  = str(task['_id'])
            del task['_id']
        return Response(tasks)

    if request.method == 'POST':
        title       = request.data.get('title')
        description = request.data.get('description', '')
        status      = request.data.get('status', 'Pending')
        due_date    = request.data.get('due_date', '')

        if not title:
            return Response({'error': 'Title is required'}, status=400)

        task = {
            'title':       title,
            'description': description,
            'status':      status,
            'due_date':    due_date,
            'user_id':     str(request.user.id),
        }
        result = task_collection.insert_one(task)
        return Response({'message': 'Task created successfully', 'id': str(result.inserted_id)}, status=201)



@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):

    try:
        task = task_collection.find_one({'_id': ObjectId(pk), 'user_id': str(request.user.id)})
    except:
        return Response({'error': 'Task not found'}, status=404)

    if not task:
        return Response({'error': 'Task not found'}, status=404)

    if request.method == 'GET':
        task['id'] = str(task['_id'])
        del task['_id']
        return Response(task)

    if request.method == 'PUT':
        task_collection.update_one(
            {'_id': ObjectId(pk)},
            {'$set': {
                'title':       request.data.get('title',       task['title']),
                'description': request.data.get('description', task['description']),
                'status':      request.data.get('status',      task['status']),
                'due_date':    request.data.get('due_date',    task['due_date']),
            }}
        )
        return Response({'message': 'Task updated successfully'})

    if request.method == 'DELETE':
        task_collection.delete_one({'_id': ObjectId(pk)})
        return Response({'message': 'Task deleted successfully'})