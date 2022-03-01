from django.http import JsonResponse

from pymongo import MongoClient
from config import mongoUrl
from bson.json_util import dumps

def getAllNews(request):
    try:
        client = MongoClient(mongoUrl)

        db = client['bank']
        collection = db['news']

        news = collection.find({})

        return JsonResponse({"news": dumps(news, indent=2)})
    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})



