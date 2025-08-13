// File location: api/youtube.js

const fetch = require('node-fetch');

module.exports = async function (context, req) {
    // This gets the key securely from your Azure Configuration settings
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; 
    
    // Get parameters from the front-end's request URL
    const chart = req.query.chart;
    const videoIds = req.query.videoIds;
    const q = req.query.q;
    const channelId = req.query.channelId;
    const type = req.query.type;

    let apiUrl = `https://www.googleapis.com/youtube/v3/`;
    let queryParams = `key=${YOUTUBE_API_KEY}`;

    // Build the correct YouTube API URL based on the request
    if (chart) {
        apiUrl += 'videos';
        queryParams += `&part=snippet,contentDetails,statistics&chart=${chart}&maxResults=25`;
    } else if (videoIds) {
        apiUrl += 'videos';
        queryParams += `&part=snippet,contentDetails,statistics&id=${videoIds}`;
    } else if (q) {
        apiUrl += 'search';
        queryParams += `&part=snippet&q=${encodeURIComponent(q)}&maxResults=20`;
        if (type === 'channel') {
             queryParams += `&type=channel`;
        } else {
             queryParams += `&type=video`;
        }
    } else if (channelId) {
        apiUrl += 'search';
        queryParams += `&part=snippet&channelId=${channelId}&maxResults=20&type=video`;
    } else {
        context.res = { status: 400, body: "Invalid request parameters." };
        return;
    }

    const fullUrl = `${apiUrl}?${queryParams}`;

    try {
        const response = await fetch(fullUrl);
        const data = await response.json();
        
        if (data.error) {
             console.error("YouTube API Error:", data.error.message);
             context.res = { status: 500, body: data.error.message };
             return;
        }

        context.res = {
            headers: { 'Content-Type': 'application/json' },
            body: data
        };
    } catch (error) {
        console.error("Function Error:", error);
        context.res = {
            status: 500,
            body: "Error fetching from YouTube API."
        };
    }
};