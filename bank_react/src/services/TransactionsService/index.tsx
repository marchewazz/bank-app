import http from "../../http-common";

import { backendUrl } from "../../utilities";

class TransactionsService{
    transferMoney(transferData: any){
        return http.post(`${backendUrl}/transaction/transfer`, transferData)
    }

    getHistory(data: any){
        return http.post(`${backendUrl}/transaction/historyaccount`, {})
    }
}

export default TransactionsService;