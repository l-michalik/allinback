import { CHAT_IDS, Telegram } from "../../src/lib/telegram";

const jsonMessage = `
\`\`\`js
const x = () => 'jana palacha'
\`\`\``

const main = async () => {
  await Telegram.sendMessage({
    chatId: CHAT_IDS.BASE_GROUP,
    message: jsonMessage,
  });
  process.exit(0);
};

main()
  .then()
  .catch((err) => console.log(err));
