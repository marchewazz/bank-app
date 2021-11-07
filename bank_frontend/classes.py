class User:
    accountNumber = 'number'
    accountEmail = ''
    accountUser = ''
    bills = ''
    def __init__(self, userData):
        self.accountNumber = userData['accountNumber']
        self.accountEmail = userData['accountEmail']
        self.accountUser = userData['accountUser']
        self.bills = userData['bills']
