import { CHAT_IDS, Telegram } from "../../src/lib/telegram";

const main = async () => {
  await Telegram.sendMessage({
    chatId: CHAT_IDS.BASE_GROUP,
    message: "Test message",
  });
  process.exit(0);
};

main()
  .then()
  .catch((err) => console.log(err));
