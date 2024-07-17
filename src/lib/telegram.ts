import "dotenv/config";
import { Telegraf, Telegram as _Telegram } from "telegraf";

export const CHAT_IDS = {
  BASE_GROUP: -4264695035, // for groups the "-" must be added
  ANTEQ: 6021707546,
};


if (!process.env.TELEGRAM_BOT_TOKEN_ACCESS) throw new Error(`Missing env: TELEGRAM_BOT_TOKEN_ACCESS`);

export class Telegram {
  static client = new Telegraf(process.env.TELEGRAM_BOT_TOKEN_ACCESS!, {
    handlerTimeout: 20_000,
  });

  static async sendMessage({ chatId, message, extraOptions }: SendMessageParams) {
    await this.client.telegram.sendMessage(chatId, message, {
      parse_mode: "MarkdownV2",
      protect_content: true,
      ...extraOptions,
    });
  }
}

export interface SendMessageParams {
  chatId: number | string;
  message: string;
  extraOptions?: Parameters<_Telegram["sendMessage"]>["2"];
}
