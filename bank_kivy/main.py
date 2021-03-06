import kivy
from kivy.app import App
from kivy.lang.builder import Builder
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.screenmanager import ScreenManager, Screen

import requests
import json
import re
from classes import User
from config import bankCurrency, backendUrl

kivy.require("2.0.0")

# SOME FUNCTIONS
def updateUserData():
    # FUNCTION UPDATES USER BILLS ETC.
    response = requests.get(f'{backendUrl}/accounts/refresh',
                            data=json.dumps({"accountNumber": BankApp.LoggedUser.accountNumber}))
    userData = json.loads(response.json()['user'])
    BankApp.LoggedUser = User(userData)


# APP CLASSES
"""
    CLEARSCREEN - function clears all labels on screen load to make sure there is no old informations
    LOADINGLABEL - sets information label as "Loading..." to show user something is working
    SETINFO - sets information label to anything
"""


class RegisterScreen(Screen):
    def clearScreen(self):
        self.ids.information.text = ""
        self.ids.accEmail.text = ""
        self.ids.accPassword.text = ""
        self.ids.accFirstName.text = ""
        self.ids.accLastName.text = ""
        self.ids.accPIN.text = ""

    def loadingLabel(self):
        self.ids.information.text = "Loading..."

    def settingInfoLabel(self, info):
        self.ids.information.text = info

    def validateInputs(self):
        if (len(self.ids.accPIN.text) > 4):
            self.ids.accPIN.text = self.ids.accPIN.text[:-1]

    def register(self):
        accountName = {
            "firstName": self.ids.accFirstName.text,
            "lastName": self.ids.accLastName.text,
        }
        accountEmail = self.ids.accEmail.text
        accountPass = self.ids.accPassword.text
        accountPIN = self.ids.accPIN.text
        if accountName and accountEmail and accountPass and accountPIN:
            # IF EVERYTHING IS PASSED WE CAN GO AND CHECK REGEX FOR DATA
            wrongPINs = ["1234", "4321", "2137"]
            if not (re.fullmatch(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', accountEmail)):
                self.settingInfoLabel("Invalid email!")
            elif re.search(r'\d', accountName["firstName"]) or re.search(r'\d', accountName["lastName"]):
                self.settingInfoLabel("How is it to have digit in name?")
            elif len(accountPass) < 8:
                self.settingInfoLabel("Too short password!")
            elif len(accountPass) > 25:
                self.settingInfoLabel("Too long password!")
            elif len(accountPIN) != 4:
                self.settingInfoLabel("PIN must be 4 digits long!")
            elif len(set(accountPIN)) == 1:
                self.settingInfoLabel("PIN cannot contain 4 same characters")
            elif accountPIN in wrongPINs:
                self.settingInfoLabel("This PIN is too easy, pass different")
            else:
                # IF ALL REGEXES ARE GOOD WE ARE MAKING REQUEST
                try:
                    response = requests.post(
                        f'{backendUrl}/accounts/register',
                        data=json.dumps({'accountName': accountName,
                                         'accountEmail': accountEmail,
                                         'accountPass': accountPass,
                                         'accountPIN': accountPIN,
                                         }))
                except:
                    self.settingInfoLabel("Server issue!")
                else:
                    response = json.loads(response.text)["message"]
                    if response == "Added!":
                        # IF USER IS REGISTERED REDIRECT TO LOGIN SCREEN
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
            # IF EVERYTHING IS PASSED WE CAN GO AND CHECK REGEX FOR DATA
            if not (re.fullmatch(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', accountEmail)):
                self.settingInfoLabel("Invalid email!")
            elif len(accountPass) < 8:
                self.settingInfoLabel("Too short password!")
            elif len(accountPass) > 25:
                self.settingInfoLabel("Too long password!")
            else:
                try:
                    # REQUEST FOR LOGIN
                    r = requests.get(f'{backendUrl}/accounts/login', data=json.dumps({
                        "accountEmail": accountEmail,
                        "accountPassword": accountPass}))
                    response = r.json()
                except:
                    self.settingInfoLabel("Server issue!")
                else:
                    if response['message'] == "Valid data!":
                        # IF EVERYTHING IS CORRECT WE CAN GO TO PASSING PIN
                        self.manager.current = 'ValidatingPINScreen'
                    else:
                        self.settingInfoLabel(response['message'])
        else:
            self.settingInfoLabel("Missing data")


class ValidatingPINScreen(Screen):
    tries = 0

    def clearScreen(self):
        self.ids.accPIN.text = ""
        self.ids.information.text = ""

    def validatePIN(self):
        # PIN CANNOT BE LONGER THAN 4 DIGITS
        if (len(self.ids.accPIN.text) > 4):
            self.ids.accPIN.text = self.ids.accPIN.text[:-1]

    def login(self):
        accountPIN = self.ids.accPIN.text
        accountEmail = self.manager.get_screen("LoginScreen").ids.accEmail.text
        if len(accountPIN) != 4:
            self.ids.information.text = "PIN must be 4 digits long!"
        else:
            r = requests.get(f"{backendUrl}/accounts/pinemail", data=json.dumps({
                "accountPIN": str(accountPIN),
                "accountEmail": accountEmail
            }))
            response = r.json()
            print(response)
            if response['message'] == "Logged!":
                self.ids.information.text = response['message']
                userData = (json.loads(response['user']))
                BankApp.LoggedUser = User(userData)
                self.manager.current = 'MainScreen'
            else:
                self.tries = self.tries + 1
                if self.tries == 3:
                    self.manager.current = 'LoginScreen'
                else:
                    self.ids.information.text = response['message']


class MainScreen(Screen):

    def createData(self):
        updateUserData()
        self.ids.mainWelcome.text = f"Welcome, {BankApp.LoggedUser.accountUser['firstName']}!"

    def logout(self):
        BankApp.LoggedUser.delete()
        self.manager.current = 'LoginScreen'


class ProfileScreen(Screen):
    def createData(self):
        updateUserData()
        user = BankApp.LoggedUser
        self.ids.accountName.text = f"Name: {user.accountUser['firstName']} {user.accountUser['lastName']}"
        self.ids.accountEmail.text = f"Email: {user.accountEmail}"
        self.ids.accountNumber.text = f"Number: {user.accountNumber}"


class HistoryScreen(Screen):
    def createData(self):
        updateUserData()
        self.ids.historyLayout.clear_widgets()
        try:
            # REQUEST FOR LOGIN
            r = requests.get(f'{backendUrl}/transactions/historyaccount', data=json.dumps({
                "accountNumber": BankApp.LoggedUser.accountNumber}))
            transactions = json.loads(r.json()['transactions'])
        except:
            self.manager.current = 'MainScreen'
        else:
            for transaction in transactions:
                print(transaction)
                layout = BoxLayout(orientation='vertical')
                layout.add_widget(Label(text=f"From: bill: {transaction['sender']['bill']}, account: {transaction['sender']['account']}"))
                layout.add_widget(Label(text=f"To: bill: {transaction['receiver']['bill']}, account: {transaction['receiver']['account']}"))
                layout.add_widget(Label(text=f"Note: {transaction['note']}"))
                layout.add_widget(Label(text=f"Amount: {transaction['amount']}{bankCurrency}"))
                self.ids.historyLayout.add_widget(layout)

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
                r = requests.put(f'{backendUrl}/bills/addown', data=json.dumps({
                    "accountNumber": BankApp.LoggedUser.accountNumber,
                    "billName": self.ids.billName.text
                }))
            except:
                self.settingInfoLabel("Server issue!")
            else:
                print(r)
                self.settingInfoLabel(r.json()['message'])

    def createData(self):
        self.ids.information.text = ""
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
        self.ids.information.text = ""
        self.ids.amount.text = ""
        self.ids.billNumber.text = ""
        self.ids.note.text = ""

        updateUserData()
        self.ids.selectBill.values = self.createBillsChoice(BankApp.LoggedUser.bills)
        self.chooseOption()
        if not BankApp.LoggedUser.favoritesBills:
            self.ids.favoriteBills.text = "You don't have any favorite bills"
        else:
            self.ids.favoriteBills.text = "Select a bill"
            self.ids.favoriteBills.values = self.createFavoriteBillsChoice(BankApp.LoggedUser.favoritesBills)

    def chooseOption(self):
        # BASED ON RADIO BUTTONS DIFFRENT WAYS TO PASS RECEIVER IS BEING SHOWN
        if self.ids.optionFavorites.state == 'down':
            self.ids.billNumber.opacity = 0
            self.ids.favoriteBills.opacity = 1
        if self.ids.optionNumber.state == 'down':
            self.ids.billNumber.opacity = 1
            self.ids.favoriteBills.opacity = 0

    def validateAmount(self):
        # VALIDATING AMOUNT EG. ONLY ONE DOT OR ONLY TWO DIGITS AFTER DOT
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
            # GETTING BILL NUMBER
            senderNumber = re.search('Bill: (.+?), ', self.ids.selectBill.text).group(1)

        if self.ids.optionFavorites.state == 'down':
            print(self.ids.favoriteBills.text)
            if self.ids.favoriteBills.text == "Select a bill":
                self.settingInfoLabel("Select receiver")
                return
            else:
                # GETTING BILL NUMBER
                receiverNumber = re.search('Bill: (.+?), ', self.ids.favoriteBills.text).group(1)

        if self.ids.optionNumber.state == 'down':
            # CHECK IF PASSED NUMBER IS 12 DIGITS LONG
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
        r = requests.put(f'{backendUrl}/transactions/transfer', data=json.dumps({
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
    print(kivy.__version__)
    BankApp().run()
