from kivy.uix.button import Button
from kivy.app import App
from kivy.lang.builder import Builder
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.popup import Popup

import requests
import json
import re


class RegisterScreen(Screen):
    def register(self):
        accountName = {
            "firstName": self.ids.accFirstName.text,
            "lastName": self.ids.accLastName.text,
        }
        accountEmail = self.ids.accEmail.text
        accountPass = self.ids.accPassword.text
        if accountName and accountEmail and accountPass:
            if not (re.fullmatch(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', accountEmail)):
                print("Invalid email!")
            elif re.search(r'\d', accountName["firstName"]) or re.search(r'\d', accountName["lastName"]):
                print("How is it to have digit in name?")
            elif len(accountPass) < 8:
                print("Too short password!")
            elif len(accountPass) > 25:
                print("Too long password!")
            else:
                print("Requested")
                response = requests.post(
                    'http://127.0.0.1:8000/accounts/register',
                    data=json.dumps({'accountName': accountName,
                                     'accountEmail': accountEmail,
                                     'accountPass': accountPass,
                                     }))
                print(response.text)
                if response.text == "Added!":
                    content = Button(text='You\'ve been registered')
                    popup = Popup(title='Success!',
                                  content=content)
                    content.bind(on_press=popup.dismiss)

                    def changeScreen(instance):
                        self.manager.current = 'LoginScreen'

                    popup.bind(on_dismiss=changeScreen)
                    popup.open()

        else:
            print("Missing data!")


class LoginScreen(Screen):
    def login(self):
        print("loggin")
        accountEmail = self.ids.accEmail.text
        accountPass = self.ids.accPassword.text
        if accountEmail and accountPass:
            if not (re.fullmatch(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', accountEmail)):
                print("Invalid email!")
            elif len(accountPass) < 8:
                print("Too short password!")
            elif len(accountPass) > 25:
                print("Too long password!")
            else:
                r = requests.get('http://127.0.0.1:8000/accounts/login', data=json.dumps({
                    "accountEmail": accountEmail,
                    "accountPassword": accountPass}))
                response = r.text
                if response == "logged":
                    self.manager.current = 'MainScreen'
                if response == "no matching email":
                    self.manager.current = 'RegisterScreen'

        else:
            print("Missing data")


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
