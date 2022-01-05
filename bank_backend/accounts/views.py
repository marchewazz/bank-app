from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from passlib.hash import django_pbkdf2_sha256 as hasher

from pymongo import MongoClient
from random import randint
import json
import datetime
from config import mongoUrl
from bson.json_util import dumps
import requests

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
                        "accountPIN": hasher.hash(account['accountPIN']),
                        "bills": [],
                        "favoriteBills": []
                    })
                except ConnectionError:
                    client.close()
                    return JsonResponse({"message": "Query problem!"})
                else:
                    # CREATE ONE BILL WITH NEW ACCOUNT
                    r = requests.put(f"http://127.0.0.1:8000/bills/add", data=json.dumps({
                        "accountNumber": randomAccNumber,
                        "billName": "Main bill"
                    }))
                    client.close()
                    return JsonResponse({"message": "Added!"})
            else:
                client.close()
                return JsonResponse({"message": "We've got already account!"})

@csrf_exempt
def login(request):
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
                        return JsonResponse({"message": "Valid data!", "user": dumps(accountsWithPassedEmail, indent=2)})
                else:
                    client.close()
                    return JsonResponse({"message": "Wrong password!"})

@csrf_exempt
def validatePINByEmail(request):
    userData = json.loads(request.body)
    print(userData)
    try:
        client = MongoClient(mongoUrl)
        db = client['bank']
        collection = db['accounts']
        account = collection.find_one({"accountEmail": userData['accountEmail']})

    except ConnectionError:
        return JsonResponse({"message": "Server problem!"})
    else:
        if hasher.verify(userData['accountPIN'], account['accountPIN']):
            return JsonResponse({"message": "Logged!", "user": dumps(account, indent=2)})
        else:
            return JsonResponse({"message": "Wrong PIN!"})


@csrf_exempt
def validatePINByAccNumber(request):
    userData = json.loads(request.body)
    print(userData)
    try:
        client = MongoClient(mongoUrl)
        db = client['bank']
        collection = db['accounts']
        account = collection.find_one({"accountNumber": userData['accountNumber']})

    except ConnectionError:
        return JsonResponse({"message": "Server problem!"})
    else:
        if hasher.verify(userData['accountPIN'], account['accountPIN']):
            return JsonResponse({"message": "Logged!", "user": dumps(account, indent=2)})
        else:
            return JsonResponse({"message": "Wrong PIN!"})


def refreshUserData(request):
    accountNumber = json.loads(request.body)['accountNumber']
    print(accountNumber)
    try:
        client = MongoClient(mongoUrl)
    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        try:
            db = client['bank']
            collection = db['accounts']

            userData = collection.find({"accountNumber": accountNumber})
        except ConnectionError:
            return JsonResponse({"message": "Database problem!"})
        else:
            return JsonResponse({"user": dumps(userData, indent=2)})