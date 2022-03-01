import http from "../../http-common";

import { backendUrl } from "../../utilities";

class NewsService {
    getAllNews() {
        return http.get(`${backendUrl}/news/getall`)
    }
}

export default NewsService;