import random

from kivy.app import App
from kivy.lang.builder import Builder
from kivy.properties import StringProperty
from kivy.uix.screenmanager import ScreenManager, Screen

import requests
import json
import re
from classes import User
from secret import bankCurrency


class RegisterScreen(Screen):
    def clearScreen(self):
        self.ids.information.text = ""
        self.ids.accEmail.text = ""
        self.ids.accPassword.text = ""
        self.ids.accFirstName.text = ""
        self.ids.accLastName.text = ""

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

    def register(self):
        def settingLabel(info):
            self.ids.information.text = info

        accountName = {
            "firstName": self.ids.accFirstName.text,
            "lastName": self.ids.accLastName.text,
        }
        accountEmail = self.ids.accEmail.text
        accountPass = self.ids.accPassword.text
        if accountName and accountEmail and accountPass:
            if not (re.fullmatch(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', accountEmail)):
                settingLabel("Invalid email!")
            elif re.search(r'\d', accountName["firstName"]) or re.search(r'\d', accountName["lastName"]):
                settingLabel("How is it to have digit in name?")
            elif len(accountPass) < 8:
                settingLabel("Too short password!")
            elif len(accountPass) > 25:
                settingLabel("Too long password!")
            else:
                try:
                    response = requests.post(
                        'http://127.0.0.1:8000/accounts/register',
                        data=json.dumps({'accountName': accountName,
                                         'accountEmail': accountEmail,
                                         'accountPass': accountPass,
                                         }))
                except:
                    settingLabel("Server issue!")
                else:
                    response = json.loads(response.text)["message"]
                    if response == "Added!":
                        self.clearScreen()
                        self.manager.current = "LoginScreen"
                        self.manager.get_screen("LoginScreen").ids.information.text = "Account Created!"
                    else:
                        settingLabel(response)

        else:
            settingLabel("Missing data!")


class LoginScreen(Screen):
    def clearScreen(self):
        self.ids.information.text = ""
        self.ids.accEmail.text = ""
        self.ids.accPassword.text = ""

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

    def createBillsChoose(self, bills):
        def formatBill(bill):
            return f"Bill: {bill['billNumber']}, name: {bill['billName']}, balance: {str(bill['billBalance'])+bankCurrency}"
        billsArray = []
        for bill in bills:
            billsArray.append(formatBill(bill))
        return billsArray

    def login(self):
        def settingLabel(info):
            self.ids.information.text = info

        accountEmail = self.ids.accEmail.text
        accountPass = self.ids.accPassword.text
        if accountEmail and accountPass:
            if not (re.fullmatch(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', accountEmail)):
                settingLabel("Invalid email!")
            elif len(accountPass) < 8:
                settingLabel("Too short password!")
            elif len(accountPass) > 25:
                settingLabel("Too long password!")
            else:
                try:
                    r = requests.get('http://127.0.0.1:8000/accounts/login', data=json.dumps({
                        "accountEmail": accountEmail,
                        "accountPassword": accountPass}))
                    response = r.json()
                except:
                    settingLabel("Server issue!")
                else:
                    if response['message'] == "Logged!":
                        userData = (json.loads(response['user']))[0]
                        BankApp.LoggedUser = User(userData)
                        self.manager.get_screen("RegisterScreen").clearScreen()
                        self.clearScreen()
                        userName = BankApp.LoggedUser.accountUser['firstName']
                        self.manager.get_screen("MainScreen").ids.accNumber.text = f'Welcome, {userName}!'
                        if not BankApp.LoggedUser.bills:
                            self.manager.get_screen("MainScreen").ids.selectedBill.text = "No bills available"
                        else:
                            self.manager.get_screen("MainScreen").ids.selectedBill.values \
                                = self.createBillsChoose(BankApp.LoggedUser.bills)
                        self.manager.current = 'MainScreen'

                    else:
                        settingLabel(response['message'])
        else:
            settingLabel("Missing data")


class MainScreen(Screen):
    def logout(self):
        BankApp.LoggedUser.delete()
        self.manager.current = 'LoginScreen'


class AddingBillScreen(Screen):

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

    def addBill(self):
        def settingLabel(info):
            self.ids.information.text = info
        if not self.ids.billName.text:
            settingLabel("Pass bill name")
        elif len(self.ids.billName.text) < 4:
            settingLabel("Bill name is too short")
        else:
            try:
                r = requests.put('http://127.0.0.1:8000/bills/add', data=json.dumps({
                    "accountNumber": BankApp.LoggedUser.accountNumber,
                    "billName": self.ids.billName.text
                }))
            except:
                settingLabel("Server issue!")
            else:
                print(r)
                settingLabel(r.json()['message'])


class MakingTransferScreen(Screen):

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

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

    def addBil(self):
        print("add bill")


class WindowManager(ScreenManager):
    pass


class BankApp(App):
    LoggedUser = User

    def build(self):
        return Builder.load_file("main.kv")


if __name__ == "__main__":
    BankApp().run()
