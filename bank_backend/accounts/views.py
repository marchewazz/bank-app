import pymongo
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from passlib.hash import django_pbkdf2_sha256 as hasher

from pymongo import MongoClient
from random import randint
import json
import datetime
from secret import mongoUrl
from bson.json_util import dumps


@csrf_exempt
def register(request):
    try:
        client = MongoClient(mongoUrl)
    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        db = client['bank']
        collection = db['accounts']
        account = json.loads(request.body)
        try:
            accountsWithPassedEmail = collection.find({"accountEmail": account['accountEmail']})
        except ConnectionError:
            client.close()
            return JsonResponse({"message": "Database problem"})
        else:
            if not list(accountsWithPassedEmail):
                try:
                    now = datetime.datetime.now()
                    while True:
                        # I NEED TO MAKE SURE ACCOUNT NUMBER IS UNIQUE
                        randomAccNumber = str(randint(100000000000, 999999999999))
                        if len(list(collection.find({"accountNumber": randomAccNumber}))) == 0: break

                    collection.insert_one({
                        "accountNumber": randomAccNumber,
                        "accountEmail": account['accountEmail'],
                        "accountUser": account['accountName'],
                        "accountCreateDate": now,
                        "accountLastLoginData": now,
                        "accountPass": hasher.hash(account['accountPass']),
                        "bills": [],
                        "favoriteBills": []
                    })
                except ConnectionError:
                    client.close()
                    return JsonResponse({"message": "Query problem!"})
                else:
                    client.close()
                    return JsonResponse({"message": "Added!"})
            else:
                client.close()
                return JsonResponse({"message": "We've got already account!"})


def login(request):
    print([pymongo.has_c()])
    account = json.loads(request.body)
    print(account)
    try:
        client = MongoClient(mongoUrl)
    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        try:
            db = client['bank']
            collection = db['accounts']

            accountsWithPassedEmail = collection.find({"accountEmail": account['accountEmail']})

        except ConnectionError:
            client.close()
            return JsonResponse({"message": "Database problem!"})
        else:
            accountsWithPassedEmail = list(accountsWithPassedEmail)
            if not accountsWithPassedEmail:
                client.close()
                return JsonResponse({"message": "No matching email!"})
            else:
                password = accountsWithPassedEmail[0]['accountPass']

                if hasher.verify(account['accountPassword'], password):
                    client.close()
                    try:
                        dateNow = {"$set": {"accountLastLoginData": datetime.datetime.now()}}
                        collection.update_many({"accountNumber": accountsWithPassedEmail[0]['accountNumber']}, dateNow)
                    except:
                        return JsonResponse({"message": "Database error!"})
                    else:
                        return JsonResponse({"message": "Logged!", "user": dumps(accountsWithPassedEmail, indent=2)})
                else:
                    client.close()
                    return JsonResponse({"message": "Wrong password!"})
