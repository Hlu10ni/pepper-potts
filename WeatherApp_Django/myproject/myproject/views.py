from django.shortcuts import render

def home(request):
    return render(request, 'weather/templates/weather/index.html')
