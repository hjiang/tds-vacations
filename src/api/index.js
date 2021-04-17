import express from 'express';

const router = express.Router();

router.post('/email-hook', (req, res) => {
  console.dir(req.body);
  res.status(200).end();
});

export default router;
