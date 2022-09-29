from urllib import request, response
from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TaskSerializer

from .models import Task


@api_view(['GET'])
def apiOverview(request):
	api_urls = {
		'List':'/task-list/',
		'Detail View':'/task-detail/<str:pk>/',
		'Create':'/task-create/',
		'Update':'/task-update/<str:pk>/',
		'Delete':'/task-delete/<str:pk>/',
		}

	return Response(api_urls)


@api_view(['GET'])
def taskList(request):
	try:
		tasks = Task.objects.all()
	except Task.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if request.method == "GET":
		serializer = TaskSerializer(tasks, many=True)
		return Response(serializer.data)


@api_view(['GET'])
def taskDetail(request, pk):

	try:
		tasks = Task.objects.get(id=pk)
	except Task.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)
	
	if request.method == "GET":
		serializer = TaskSerializer(tasks, many=False)
		return Response(serializer.data)


@api_view(['POST'])
def taskCreate(request):
    serializer = TaskSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
    
    return Response(serializer.data)


@api_view(['PUT'])
def taskUpdate(request, pk):

	try:
		task = Task.objects.get(id=pk)
	except task.DoesNotExist:
		return response(status=status.HTTP_404_NOT_FOUND)
    
	if request.method == "PUT":
		serializer = TaskSerializer(task, data=request.data)
		data={}
		if serializer.is_valid():
			serializer.save()
			data["success"] = "update succesful"
			return Response(data=data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def taskDelete(request, pk):
	
	try:
		task = Task.objects.get(id=pk)
	except Task.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)
    
	if request.method == "DELETE":
		operation = task.delete()
		data={}
		if operation:
			data["success"] = "delete succesful"
		else:
			data["failure"] = "delete failed"
		return Response(data=data)