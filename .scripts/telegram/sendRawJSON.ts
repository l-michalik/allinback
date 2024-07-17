import { CHAT_IDS, Telegram } from "../../src/lib/telegram";

const rawJSONMessage = (input: object) => `
\`\`\`json
${JSON.stringify(input)}
\`\`\``;

const main = async () => {
  await Telegram.sendMessage({
    chatId: CHAT_IDS.BASE_GROUP,
    message: rawJSONMessage({ siema: 1, tab: [1, 2, 4] }),
  });
  process.exit(0);
};

main()
  .then()
  .catch((err) => console.log(err));
