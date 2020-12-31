// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const {google} = require('googleapis');

export default (req, res) => {

  /**
   * Fetch data from request body
   */
  const {apiKey, videoId, searchTerm, sortBy} = JSON.parse(req.body)

  /**
   * Store data from request body
   */
  const API_KEY = apiKey
  const VIDEO_ID = videoId
  const SORT_BY = sortBy == 'Most Recent' ? 'time' : 'relevance' // time or relevance
  const SEARCH_TERMS = searchTerm ? searchTerm : ''
  
  /**
   * Create API handler
   */
  const youtube = google.youtube({
    version: 'v3',
    auth: API_KEY
  })
  
  /**
   * Create API params
   */
  const params = {
    "part": [
      "snippet"
    ],
    "maxResults": 100,
    "order": SORT_BY,
    "searchTerms": SEARCH_TERMS,
    "videoId": VIDEO_ID
  }

  console.log(params)

  /**
   * Initial comments
   */
  let comments = []
  
  /**
   * Attempt to fetch comments
   */
  return new Promise((resolve, reject) => {
    youtube.commentThreads.list(params)
      .then(data => {
        data.data.items.forEach(comment => comments.push(comment.snippet.topLevelComment.snippet.textOriginal.replace(/(\r\n|\n|\r)/gm, "")))
        comments = comments.filter(comment => comment.includes(SEARCH_TERMS))
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ comments }))
        resolve()
      })
      .catch(error => {
        res.statusCode = 400
        res.end(JSON.stringify({error}))
        return resolve()
      });
  })
}
