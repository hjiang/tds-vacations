import bolt from '@slack/bolt';
import LC from 'leanengine';
import axios from 'axios';

const Vacation = LC.Object.extend('Vacation');

const handleVacation = async ({ say }) => {
  try {
    await say('收到，这就去查一下 ...');
  } catch (e) {
    console.error(e);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let query = new LC.Query('Vacation');
  query.lessThanOrEqualTo('startDate', today);
  query.greaterThanOrEqualTo('endDate', today);
  try {
    let results = await query.find();
    if (results.length === 0) {
      await say('今天大家都在干活！');
    } else {
      let resp = '今天有这些同事在休假中：\n';
      for (const result of results) {
        const name = result.get('name');
        const startDate = result.get('startDate').toDateString();
        const endDate = result.get('endDate').toDateString();
        resp += `${name}: ${startDate} ~ ${endDate}\n`;
      }
      await say(resp);
    }
    query = new LC.Query('Vacation');
    query.greaterThan('startDate', today);
    results = await query.find();
    if (results.length > 0) {
      let resp = '未来几天还有这些同事会休假：\n';
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
      await say(`查询错误: ${e.code}: ${e.message}`);
    } catch (e) {
      console.error(e);
    }
  }
};

const turingBotAnswer = async (message) => {
  const apiKey = process.env.TURING_BOT_API_KEY;
  const result = await axios({
    method: 'post',
    url: 'http://openapi.tuling123.com/openapi/api/v2',
    data: {
      reqType: 0,
      perception: {
        inputText: {
          text: message.text
        }
      },
      userInfo: {
        apiKey: apiKey,
        userId: message.user,
        groupId: message.team
      }
    }
  });
  if (result.data.results && result.data.results.length > 0) {
    const firstTextResult = result.data.results.find((r) => r.values.text);
    if (firstTextResult) {
      return firstTextResult.values.text;
    } else {
      return undefined;
    }
  } else {
    return undefined;
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

  app.message(async ({ message, say }) => {
    if (message.text.indexOf('vacation') >= 0) return;
    console.dir(message);
    try {
      const answer = await turingBotAnswer(message);
      if (answer) {
        await say(answer);
      } else {
        await say('hmmm ...');
      }
    } catch (e) {
      console.error(e);
    }
  });

  app.command('/addVacationGroup', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    console.dir(command);

    await say(`${command.text}`);
  });

  return app;
};
