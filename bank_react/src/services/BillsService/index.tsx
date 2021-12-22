import http from "../../http-common";

import { backendUrl } from "../../utilities";

class BillsService{
    getBills(accountData: any){
        return http.post(`${backendUrl}/bills/getall`, accountData)
    }
}

export default BillsService;