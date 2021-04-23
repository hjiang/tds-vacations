import bolt from '@slack/bolt';
import LC from 'leanengine';

const Vacation = LC.Object.extend('Vacation');

const handleVacation = async ({ say }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const query = new LC.Query('Vacation');
  query.lessThanOrEqualTo('startDate', today);
  query.greaterThanOrEqualTo('endDate', today);
  try {
    const results = await query.find();
    if (results.length === 0) {
      await say('大家都在。一颗赛艇！');
      return;
    } else {
      var resp = '今天缺席的常委有：\n';
      for (const result of results) {
        const name = result.get('name');
        const startDate = result.get('startDate').toDateString();
        const endDate = result.get('endDate').toDateString();
        resp += `${name}: ${startDate} ~ ${endDate}\n`;
      }
      await say(resp);
    }
  } catch (e) {
    console.error(e);
    try {
      await say(`查询错误。I am angry!! ${e.code}: ${e.message}`);
    } catch (e) {
      console.error(e);
    }
  }
};

export const startBoltApp = async () => {
  const app = new bolt.App({
    token: process.env.SLACK_BOT_TOKEN,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
  });

  await app.start();
  app.message('vacation', handleVacation);
  app.message(bolt.directMention(), 'vacation', handleVacation);
  return app;
};
