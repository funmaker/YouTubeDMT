import youtube from "youtube-dl";

const router = require('express-promise-router')();
export default router;

router.get('/youtube', (req, res) => {
  const url = req.query.url || req.body.url;
  
  if(!url) return res.status(400).json({error: "url parameter is required"});
  
  const audio = youtube(url, ["-x", "--no-playlist"], {});
  audio.on('error', err => {
    res.status(500).json({error: err.message});
  });
  
  audio.pipe(res);
});

