from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

import json
from pymongo import MongoClient
from secret import mongoUrl
from random import randint


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
                    { "$push": { "bills" : {
                            "billNumber": billNumber,
                            "billName": billName,
                            "billBalance": 0.00
                        }}
                    }
                )
            except ConnectionError:
                client.close()
                return JsonResponse({"message": "Database problem"})
            else:
                return JsonResponse({"message": "Bill created!"})