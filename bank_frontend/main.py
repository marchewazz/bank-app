from kivy.uix.button import Button
from kivy.app import App
from kivy.lang.builder import Builder
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.popup import Popup

import requests
import json
import re


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
                    settingLabel(response.text)

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
                    response = r.text
                except:
                    settingLabel("Server issue!")
                else:
                    settingLabel(r.text)

        else:
            settingLabel("Missing data")


class MainScreen(Screen):
    pass


class WindowManager(ScreenManager):
    pass


kv = Builder.load_file("main.kv")


class BankApp(App):
    def build(self):
        return kv


if __name__ == "__main__":
    BankApp().run()
