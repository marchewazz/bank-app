from datetime import datetime

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from pymongo import MongoClient
from config import mongoUrl
import json
from bson.json_util import dumps

@csrf_exempt
def transferMoney(request):

    transferData = json.loads(request.body)
    print(transferData)
    if transferData['sender'] == transferData['receiver']: return JsonResponse({"message": "You cannot transfer money between two same bills"})
    try:
        client = MongoClient(mongoUrl)
        db = client['bank']
        accountsCol = db['accounts']
        transactionCol = db['transactions']
    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        with client.start_session() as session:
            with session.start_transaction():
                senderUser = list(accountsCol.find({
                        "bills":{
                            "$elemMatch": {
                                "billNumber": transferData['sender']
                            }
                        }
                    }))
                receiverUser = list(accountsCol.find({
                        "bills":{
                            "$elemMatch": {
                                "billNumber": transferData['receiver']
                            }
                        }
                    }))
                if receiverUser != [] and senderUser != []:
                    filter = {"bills": {
                            "$elemMatch": {
                                "billNumber": transferData['sender']
                            }
                        }}
                    accountsCol.update_one({"bills.billNumber": transferData['sender']}, {"$inc": {"bills.$.billBalance": -float(transferData['amount'])}}, session=session)
                    accountsCol.update_one({"bills.billNumber": transferData['receiver']}, {"$inc": {"bills.$.billBalance": float(transferData['amount'])}}, session=session)

                    updatedSenderUser = list(accountsCol.find({
                        "bills": {
                            "$elemMatch": {
                                "billNumber": transferData['sender']
                            }
                        }
                    }, session=session))[0]

                    for x in updatedSenderUser['bills']:
                        if x['billNumber'] == transferData['sender']:
                            amount = x['billBalance']
                    if amount > 0:
                        now = datetime.now()
                        transactionCol.insert_one({
                            "sender": {
                                "account": updatedSenderUser['accountNumber'],
                                "bill": transferData['sender']
                            },
                            "receiver": {
                                "account": receiverUser[0]['accountNumber'],
                                "bill": transferData['receiver']
                            },
                            "amount": transferData['amount'],
                            "note": transferData['note'],
                            "date": now
                        }, session=session)
                        session.commit_transaction()
                        return JsonResponse({"message": "Transfer done!"})
                    else:
                        session.abort_transaction()
                        return JsonResponse({"message": "Not enough money on a bill"})
                else:
                    return JsonResponse({"message": "Check your sender and receiver data and try again later"})
@csrf_exempt
def getHistoryByAccount(request):

    accountNumber = json.loads(request.body)['accountNumber']

    try:
        client = MongoClient(mongoUrl)
        db = client['bank']
        transactions = db['transactions']

    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        history = list(transactions.find({"$or": [
            {"receiver.account": accountNumber},
            {"sender.account": accountNumber},
        ]}))

        print(history)

        return JsonResponse({"transactions": dumps(history, indent=2)})

@csrf_exempt
def getHistoryByBill(request):
    accountNumber = json.loads(request.body)['accountNumber']
    print(request.body)
    try:
        client = MongoClient(mongoUrl)
        db = client['bank']
        transactions = db['transactions']

    except ConnectionError:
        return JsonResponse({"message": "Database problem!"})
    else:
        history = list(transactions.find({"$or": [
            {"receiver.bill": accountNumber},
            {"sender.bill": accountNumber},
        ]}))

        print(history)

        return JsonResponse({"transactions": dumps(history, indent=2)})