from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

import json
from pymongo import MongoClient
from config import mongoUrl
from random import randint
from bson.json_util import dumps

@csrf_exempt
def addBill(request):
    data = json.loads(request.body)
    billName = data['billName']

    try:
        client = MongoClient(mongoUrl)
    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        db = client['bank']
        collection = db['accounts']
        try:
            getUser = collection.find_one({
                "accountNumber": data['accountNumber']
            })
            print(getUser)
            billsWithPassedName = [bill for bill in getUser['bills'] if bill['billName'] == billName]
        except ConnectionError:
            return JsonResponse({"message": "Database problem"})
        else:
            print(billsWithPassedName)
            if len(list(billsWithPassedName)) != 0: return JsonResponse({"message": "You already have bill with this "
                                                                                    "name, choose something different"})
            while True:
                billNumber = str(randint(100000000000, 999999999999))
                try:
                    billsWithRandomNumber = collection.find({
                        "bills":{
                            "$elemMatch": {
                                "billNumber": billNumber
                            }
                        }
                    })
                    if len(list(billsWithRandomNumber)) == 0: break
                except ConnectionError:
                    client.close()
                    return JsonResponse({"message": "Database problem"})
            try:
                collection.update(
                    {"accountNumber": data['accountNumber']},
                    {"$push": {"bills": {
                            "billNumber": billNumber,
                            "billName": billName,
                            "billBalance": 0.00
                    }}}
                )
            except ConnectionError:
                client.close()
                return JsonResponse({"message": "Database problem"})
            else:
                return JsonResponse({"message": "Bill created!"})


@csrf_exempt
def deleteBill(request):

    billNumber = json.loads(request.body)["billNumber"]
    accountNumber = json.loads(request.body)["accountNumber"]
    print(request.body)
    try:
        client = MongoClient(mongoUrl)
        db = client['bank']
        accountsCol = db['accounts']
        user = accountsCol.find_one({"accountNumber": accountNumber}, {"bills": 1})

    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        if len(user["bills"]) == 1:
            return JsonResponse({"message": "You have only one bill"})
        else:
            try:
                accountsCol.update_one({"accountNumber": accountNumber}, {"$pull": {"bills":{"billNumber": billNumber}}})
            except ConnectionError:
                return JsonResponse({"message": "Database problem!"})
            else:
                return JsonResponse({"message": "Bill deleted!"})


@csrf_exempt
def getBills(request):
    accountNumber = json.loads(request.body)['accountNumber']
    print(accountNumber)
    try:
        client = MongoClient(mongoUrl)
    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        db = client['bank']
        collection = db['accounts']

        accountBills = list(collection.find({"accountNumber": accountNumber}, {"_id": 0,"bills": 1}))[0]['bills']
        print(accountBills)
        return JsonResponse({"bills": accountBills})


@csrf_exempt
def getOneBill(request):
    billNumber = json.loads(request.body)['billNumber']

    try:
        client = MongoClient(mongoUrl)
    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        db = client['bank']
        collection = db['accounts']

        accountBills = list(collection.find({"bills.billNumber": billNumber}))[0]['bills']

        for bill in accountBills:
            if bill["billNumber"] == billNumber: bill = bill

        return JsonResponse({"bill": dumps(bill, indent=2)})
