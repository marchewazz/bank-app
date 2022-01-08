import http from "../../http-common";

import { backendUrl } from "../../utilities";

class TransactionsService{
    transferMoney(transferData: any){
        return http.post(`${backendUrl}/transactions/transfer`, transferData)
    }
    getHistoryByAccountNumber(accountData: any){
        return http.post(`${backendUrl}/transactions/historyaccount`, accountData)
    }
}

export default TransactionsService;