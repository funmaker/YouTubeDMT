import api from './api';

const router = require('express-promise-router')();
export default router;

router.use("/api", api);

router.get('/', (req, res) => {
	const initialData = {};
  
  initialData.url = req.query.url;
  initialData.seed = req.query.seed;
	
	res.react(initialData);
});

