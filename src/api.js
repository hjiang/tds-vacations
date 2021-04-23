import express from 'express';
import LC from 'leanengine';

const router = express.Router();
const Vacation = LC.Object.extend('Vacation');

const extractVacationInfo = (text) => {
  const matches = [...text.matchAll(/[0-9\/]{10}/g)];
  if (matches.length !== 2) return {};
  const startDate = new Date(matches[0][0]);
  const endDate = new Date(matches[1][0]);

  const nameStart = text.indexOf('发起了') + 3;
  const nameEnd = text.indexOf('申请');
  const name = text.slice(nameStart, nameEnd);
  return { name, startDate, endDate };
};

router.post('/email-hook', async (req, res, next) => {
  // 您好： LeanCloud 部门的 发起了 xxxx 申请 休假 ，申请时间段为 2021/04/21 2021/04/21 ，时长为 0.5 天，请知晓。
  const text = req.body['stripped-text'];
  const { name, startDate, endDate } = extractVacationInfo(text);
  if (!name || !startDate || !endDate) {
    console.error(`Received unexpected email: ${text}`);
    res.status(200).end();
    return;
  }

  try {
    const vacation = new Vacation();
    await vacation.save({ name, startDate, endDate });
  } catch (e) {
    next(e);
  }

  res.status(200).end();
});

export default router;
