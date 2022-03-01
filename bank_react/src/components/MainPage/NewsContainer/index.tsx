import React, { useEffect, useState } from "react";

import NewsService from "../../../services/NewsService";

function NewsContainer() {

    const [news, setNews]: any[] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    var ns: NewsService = new NewsService();

    function generateNews() {
        var newsDivs = [];
        
        for(const info of news) {
            newsDivs.push(
            <div className="border-b-2 border-gray-400 mt-2">
                <div className="flex justify-between">
                    <span className="font-bold">
                        {info.newsHeader}
                    </span>
                    <span className="text-gray-400">
                        {new Date(info.newsDate.$date).toUTCString()}
                    </span>
                </div>
                <div className="mt-8">
                    <p>
                        {info.newsText}
                    </p>
                </div>
            </div>
            )
        }

        return newsDivs
    }
    
    useEffect(() => {
        ns.getAllNews().then((res: any) => {
            setNews(JSON.parse(res.data.news))
            setIsLoaded(true)
        })
    }, [])
    

    return (
        <div className="grid">
            {!isLoaded ? (
                <span>
                    Loading...
                </span>
            ) : (
                <>
                    <span className="text-2xl italic place-self-center">
                        News
                    </span>
                    <div className="mt-5">
                        {generateNews()}
                    </div>
                </>
            )}
            
        </div>
    )
}

export default NewsContainer;