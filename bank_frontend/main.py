from kivy.app import App
from kivy.lang.builder import Builder
from kivy.properties import StringProperty
from kivy.uix.screenmanager import ScreenManager, Screen

import requests
import json
import re
from classes import User


class RegisterScreen(Screen):
    def loadingLabel(self):
        #IT'S EVEN WEIRDER BUT I NEED THIS FUNCTION IN THIS SCOPE TO KV LANG
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
                        self.manager.current = "LoginScreen"
                        self.manager.get_screen("LoginScreen").ids.information.text = "Account Created!"
                    else:
                        settingLabel(response)

        else:
            settingLabel("Missing data!")


class LoginScreen(Screen):
    def loadingLabel(self):
        #IT'S EVEN WEIRDER BUT I NEED THIS FUNCTION IN THIS SCOPE TO KV LANG
        self.ids.information.text = "Loading..."
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
                        userName = BankApp.LoggedUser.accountUser['firstName']
                        self.manager.get_screen("MainScreen").ids.accNumber.text = f'Welcome, {userName}!'
                        self.manager.current = 'MainScreen'

                    else:
                        settingLabel(response['message'])
        else:
            settingLabel("Missing data")


class MainScreen(Screen):
    pass


class WindowManager(ScreenManager):
    something = StringProperty('test')


class BankApp(App):
    LoggedUser = User
    def build(self):
        return Builder.load_file("main.kv")


if __name__ == "__main__":
    BankApp().run()
