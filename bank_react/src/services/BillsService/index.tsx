import http from "../../http-common";

import { backendUrl } from "../../utilities";

class BillsService{

    deleteOwnBill(billData: any){
        return http.post(`${backendUrl}/bills/deleteown`, billData)
    }

    getBills(accountData: any){
        return http.post(`${backendUrl}/bills/getall`, accountData)
    }

    getOneBill(billData: any){
        return http.post(`${backendUrl}/bills/getonebill`, billData)
    }
}

export default BillsService;