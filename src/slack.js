import bolt from '@slack/bolt';

export const startBoltApp = async () => {
  const app = new bolt.App({
    token: process.env.SLACK_BOT_TOKEN,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
  });

  await app.start();
  app.message('vacations', async ({ message, say }) => {
    console.log('message received');
    await say(`Hello, <@${message.user}>`);
  });
  return app;
};
