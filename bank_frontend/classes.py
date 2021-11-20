class User:
    accountNumber = ''
    accountEmail = ''
    accountUser = ''
    bills = ''
    favoritesBills = ''
    def __init__(self, userData):
        self.accountNumber = userData['accountNumber']
        self.accountEmail = userData['accountEmail']
        self.accountUser = userData['accountUser']
        self.bills = userData['bills']
        self.favoritesBills = userData['favoriteBills']

    def delete(self):
        self.accountNumber = ''
        self.accountEmail = ''
        self.accountUser = ''
        self.bills = ''
        self.favoritesBills = ''
