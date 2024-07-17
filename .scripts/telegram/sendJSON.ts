import { CHAT_IDS, Telegram } from "../../src/lib/telegram";

const jsonMessage = `
\`\`\`json
{
	"key": "value",
	"benc": "akyc",
	"one":{
		"dic":" "k"
		}
}
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
