import React from "react";
import { useLocation } from "react-router-dom";

export var backendUrl = "http://127.0.0.1:8000";

export function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}
