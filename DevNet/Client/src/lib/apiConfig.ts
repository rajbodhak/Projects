const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' ? 'http://localhost:8000' : `http://${hostname}:8000`;
};

export const API_BASE_URL = getApiBaseUrl();