import http from "../../http-common";

import { backendUrl } from "../../utilities";

class TransactionsService{
    transferMoney(transferData: any){
        return http.post(`${backendUrl}/transaction/transfer`, transferData)
    }
}

export default TransactionsService;