class User:
    accountNumber = ''
    accountEmail = ''
    accountUser = ''
    bills = ''
    def __init__(self, userData):
        self.accountNumber = userData['accountNumber']
        self.accountEmail = userData['accountEmail']
        self.accountUser = userData['accountUser']
        self.bills = userData['bills']

    def delete(self):
        self.accountNumber = ''
        self.accountEmail = ''
        self.accountUser = ''
        self.bills = ''
