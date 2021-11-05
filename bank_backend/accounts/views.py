from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from passlib.hash import django_pbkdf2_sha256 as hasher

from pymongo import MongoClient
from random import randint
import json
import datetime
from secret import mongoUrl

@csrf_exempt
def register(request):
    try:
        client = MongoClient(mongoUrl)
    except ConnectionError:
        return HttpResponse("Database problem")
    else:
        db = client['bank']
        collection = db['accounts']
        account = json.loads(request.body)
        try:
            accountsWithPassedEmail = collection.find({"accountEmail": account['accountEmail']})
        except ConnectionError:
            client.close()
            return HttpResponse("Database problem")
        else:
            if  not list(accountsWithPassedEmail):
                try:
                    now = datetime.datetime.now()
                    collection.insert_one({
                        "accountNumber": str(randint(100000000000,999999999999)),
                        "accountEmail": account['accountEmail'],
                        "accountUser": account['accountName'],
                        "accountCreateDate": now,
                        "accountLastLoginData": now,
                        "accountPass": hasher.hash(account['accountPass']),
                        "bills": []
                    })

                except ConnectionError:
                    client.close()
                    return HttpResponse("Query problem")
                else:
                    client.close()
                    return HttpResponse("Added!")
            else:
                client.close()
                return HttpResponse("We've got already account")
def login(request):
    account = json.loads(request.body)
    print(account)
    try:
        client = MongoClient(mongoUrl)
    except ConnectionError:
        return HttpResponse("Database problem")
    else:
        try:
            db = client['bank']
            collection = db['accounts']
            
            accountsWithPassedEmail = collection.find({"accountEmail": account['accountEmail']})

        except ConnectionError:
            client.close()
            return HttpResponse("Database problem")
        else:
            accountsWithPassedEmail = list(accountsWithPassedEmail)
            if not accountsWithPassedEmail:
                client.close()
                return HttpResponse("no matching email")
            else:
                password = accountsWithPassedEmail[0]['accountPass']

                if hasher.verify(account['accountPassword'], password):
                    client.close()
                    return HttpResponse("logged")
                else:
                    client.close()
                    return HttpResponse("wrong password")
