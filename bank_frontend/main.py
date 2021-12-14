from kivy.app import App
from kivy.lang.builder import Builder
from kivy.uix.screenmanager import ScreenManager, Screen

import requests
import json
import re
from classes import User
from config import bankCurrency, backendUrl

#some functions
def updateUserData():
    response = requests.get(f'{backendUrl}/accounts/refresh', data=json.dumps({"accountNumber": BankApp.LoggedUser.accountNumber}))
    userData = json.loads(response.json()['user'])[0]
    BankApp.LoggedUser = User(userData)
# app classes
class RegisterScreen(Screen):
    def clearScreen(self):
        self.ids.information.text = ""
        self.ids.accEmail.text = ""
        self.ids.accPassword.text = ""
        self.ids.accFirstName.text = ""
        self.ids.accLastName.text = ""

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

    def settingInfoLabel(self, info):
        self.ids.information.text = info

    def register(self):
        accountName = {
            "firstName": self.ids.accFirstName.text,
            "lastName": self.ids.accLastName.text,
        }
        accountEmail = self.ids.accEmail.text
        accountPass = self.ids.accPassword.text
        if accountName and accountEmail and accountPass:
            if not (re.fullmatch(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', accountEmail)):
                self.settingInfoLabel("Invalid email!")
            elif re.search(r'\d', accountName["firstName"]) or re.search(r'\d', accountName["lastName"]):
                self.settingInfoLabel("How is it to have digit in name?")
            elif len(accountPass) < 8:
                self.settingInfoLabel("Too short password!")
            elif len(accountPass) > 25:
                self.settingInfoLabel("Too long password!")
            else:
                try:
                    response = requests.post(
                        f'{backendUrl}/accounts/register',
                        data=json.dumps({'accountName': accountName,
                                         'accountEmail': accountEmail,
                                         'accountPass': accountPass,
                                         }))
                except:
                    self.settingInfoLabel("Server issue!")
                else:
                    response = json.loads(response.text)["message"]
                    if response == "Added!":
                        self.clearScreen()
                        self.manager.current = "LoginScreen"
                        self.manager.get_screen("LoginScreen").ids.information.text = "Account Created!"
                    else:
                        self.settingInfoLabel(response)

        else:
            self.settingInfoLabel("Missing data!")


class LoginScreen(Screen):

    def clearScreen(self):
        self.ids.information.text = ""
        self.ids.accEmail.text = ""
        self.ids.accPassword.text = ""

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

    def settingInfoLabel(self, info):
        self.ids.information.text = info

    def login(self):
        accountEmail = self.ids.accEmail.text
        accountPass = self.ids.accPassword.text
        if accountEmail and accountPass:
            if not (re.fullmatch(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', accountEmail)):
                self.settingInfoLabel("Invalid email!")
            elif len(accountPass) < 8:
                self.settingInfoLabel("Too short password!")
            elif len(accountPass) > 25:
                self.settingInfoLabel("Too long password!")
            else:
                try:
                    r = requests.get(f'{backendUrl}/accounts/login', data=json.dumps({
                        "accountEmail": accountEmail,
                        "accountPassword": accountPass}))
                    response = r.json()
                except:
                    self.settingInfoLabel("Server issue!")
                else:
                    if response['message'] == "Logged!":
                        userData = (json.loads(response['user']))[0]
                        BankApp.LoggedUser = User(userData)
                        self.manager.get_screen("RegisterScreen").clearScreen()
                        self.clearScreen()
                        self.manager.current = 'MainScreen'
                    else:
                        self.settingInfoLabel(response['message'])
        else:
            self.settingInfoLabel("Missing data")


class MainScreen(Screen):

    def createBillsChoice(self, bills):
        def formatBill(bill):
            return f"Bill: {bill['billNumber']}, name: {bill['billName']}, balance: {str(bill['billBalance']) + bankCurrency}"

        billsArray = []
        for bill in bills:
            billsArray.append(formatBill(bill))
        return billsArray

    def createData(self):
        updateUserData()
        self.ids.mainWelcome.text = f"Welcome, {BankApp.LoggedUser.accountUser['firstName']}!"
        if not BankApp.LoggedUser.bills:
            self.ids.selectedBill.text = "No bills available"
        else:
            self.ids.selectedBill.values \
                = self.createBillsChoice(BankApp.LoggedUser.bills)

    def logout(self):
        BankApp.LoggedUser.delete()
        self.manager.current = 'LoginScreen'


class AddingBillScreen(Screen):

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

    def settingInfoLabel(self, info):
        self.ids.information.text = info

    def addBill(self):
        if not self.ids.billName.text:
            self.settingInfoLabel("Pass bill name")
        elif len(self.ids.billName.text) < 4:
            self.settingInfoLabel("Bill name is too short")
        else:
            try:
                r = requests.put(f'{backendUrl}/bills/add', data=json.dumps({
                    "accountNumber": BankApp.LoggedUser.accountNumber,
                    "billName": self.ids.billName.text
                }))
            except:
                self.settingInfoLabel("Server issue!")
            else:
                print(r)
                self.settingInfoLabel(r.json()['message'])
    def createData(self):
        updateUserData()

class MakingTransferScreen(Screen):

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

    def settingInfoLabel(self, info):
        self.ids.information.text = info

    def createBillsChoice(self, bills):
        def formatBill(bill):
            return f"Bill: {bill['billNumber']}, name: {bill['billName']}, balance: {str(bill['billBalance']) + bankCurrency}"

        billsArray = []
        for bill in bills:
            billsArray.append(formatBill(bill))
        return billsArray

    def createFavoriteBillsChoice(self, bills):
        def formatBill(bill):
            return f"Bill: {bill['favBillNumber']}, name: {bill['favBillName']}"

        billsArray = []
        for bill in bills:
            billsArray.append(formatBill(bill))
        return billsArray

    def createData(self):
        updateUserData()
        self.ids.selectBill.values = self.createBillsChoice(BankApp.LoggedUser.bills)
        self.chooseOption()
        if not BankApp.LoggedUser.favoritesBills:
            self.ids.favoriteBills.text = "You don't have any favorite bills"
        else:
            self.ids.favoriteBills.text = "Select a bill"
            self.ids.favoriteBills.values = self.createFavoriteBillsChoice(BankApp.LoggedUser.favoritesBills)

    def chooseOption(self):
        print(self.ids.optionFavorites.state)
        if self.ids.optionFavorites.state == 'down':
            self.ids.billNumber.opacity = 0
            self.ids.favoriteBills.opacity = 1
        if self.ids.optionNumber.state == 'down':
            self.ids.billNumber.opacity = 1
            self.ids.favoriteBills.opacity = 0

    def validateAmount(self):

        amount = self.ids.amount.text
        if amount:
            if "." in amount:
                if len(self.ids.amount.text.split(".", 1)[1]) > 2:
                    amount = amount[:-1]
                    self.ids.amount.text = amount
            if "-" in amount:
                self.ids.amount.text = ""
            if amount[0] == ".":
                self.ids.amount.text = "0."
            if amount[0] == "0":
                if len(amount) > 1:
                    if amount[1] != "0" and amount[1] != ".":
                        self.ids.amount.text = self.ids.amount.text[1:]
    def makeTransfer(self):
        self.loadingLabel()

        if self.ids.selectBill.text == "Select a bill":
            self.settingInfoLabel("Select sender")
            return
        else:
            senderNumber = re.search('Bill: (.+?), ', self.ids.selectBill.text).group(1)

        if self.ids.optionFavorites.state == 'down':
            print(self.ids.favoriteBills.text)
            if self.ids.favoriteBills.text == "Select a bill":
                self.settingInfoLabel("Select receiver")
                return
            else:
                receiverNumber = re.search('Bill: (.+?), ', self.ids.favoriteBills.text).group(1)

        if self.ids.optionNumber.state == 'down':
            if bool(re.match(r"(\d{12})$", self.ids.billNumber.text)):
                receiverNumber = self.ids.billNumber.text
            else:
                self.settingInfoLabel("Pass correct receiver number")
                return

        if not self.ids.amount.text:
            self.settingInfoLabel("Pass amount")
            return
        else:
            amount = self.ids.amount.text

        note = self.ids.note.text
        r = requests.put(f'{backendUrl}/transaction/transfer', data=json.dumps({
            "sender": senderNumber,
            "receiver": receiverNumber,
            "amount": float(amount),
            "note": note
        }))
        self.settingInfoLabel(r.json()['message'])


class WindowManager(ScreenManager):
    pass


class BankApp(App):
    LoggedUser = User

    def build(self):
        return Builder.load_file("main.kv")


if __name__ == "__main__":
    BankApp().run()
