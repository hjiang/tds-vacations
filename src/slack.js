import bolt from '@slack/bolt';
import LC from 'leanengine';

const Vacation = LC.Object.extend('Vacation');

const handleVacation = async ({ say }) => {
  try {
    await say('收到，这就去查一下 ...');
  } catch (e) {
    console.error(e);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const query = new LC.Query('Vacation');
  query.lessThanOrEqualTo('startDate', today);
  query.greaterThanOrEqualTo('endDate', today);
  try {
    const results = await query.find();
    if (results.length === 0) {
      await say('今天大家都在干活！');
      return;
    } else {
      var resp = '今天有这些同事在休假中：\n';
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

const externalRobotAnswer = async (textInput) => {
  const apiKey = process.env.TURING_BOT_API_KEY;
  const result = await axios({
    method: 'post',
    url: 'http://openapi.tuling123.com/openapi/api/v2',
    data: {
      reqType: 0,
      perception: {
        inputText: {
          text: textInput
        }
      },
      userInfo: {
        apiKey: apiKey,
        userId: Math.random().toString(36).substring(2, 15)
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
    console.dir(message);
    await say('message received');
  });

  app.command('/addVacationGroup', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    console.dir(command);

    await say(`${command.text}`);
  });

  return app;
};
