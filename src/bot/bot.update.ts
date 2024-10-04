import { log } from "console";
import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from "nestjs-telegraf";
import { text } from "stream/consumers";
import { Context, Markup } from "telegraf";
import { BotService } from "./bot.service";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }

  @Command("stop")
  async onStop(@Ctx() ctx: Context) {
    await this.botService.onStop(ctx);
  }

  @Command("address")
  async onAddress(@Ctx() ctx: Context) {
    await this.botService.onAddress(ctx);
  }

  @Command("car")
  async onCars(@Ctx() ctx: Context) {
    await this.botService.onCar(ctx);
  }

  @Hears("Adding new car")
  async addNewCar(@Ctx() ctx: Context) {
    await this.botService.addNewCar(ctx);
  }

  @Hears("My cars")
  async myCars(@Ctx() ctx: Context) {
    await this.botService.myCars(ctx);
  }

  @Hears("Adding new address")
  async addNewAddress(@Ctx() ctx: Context) {
    await this.botService.addNewAddress(ctx);
  }

  @Hears("My Addresses")
  async myAddresses(@Ctx() ctx: Context) {
    await this.botService.myAddresses(ctx);
  }

  @On("text")
  async comingText(@Ctx() ctx: Context) {
    await this.botService.comingText(ctx);
  }

  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    await this.botService.onLocation(ctx);
  }

  @Action(/location_+[1-9]/)
  async onClickLocation(@Ctx() ctx: Context) {
    await this.botService.onClickLocation(ctx);
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }

  // @Hears("Adding new address")
  // async addNewAddress(@Ctx() ctx: Context) {
  //   await this.botService.addNewAddress(ctx);
  // }
  // @Hears("hi")
  // async hearsHi(@Ctx() ctx: Context) {
  //   await ctx.reply("Hey, there");
  // }

  // @Command("inline")
  // async inlineButtons(@Ctx() ctx: Context) {
  //   const inlineKeyboard = [
  //     [
  //       { text: "Button 1", callback_data: "button1" },
  //       { text: "Button 2", callback_data: "button2" },
  //       { text: "Button 3", callback_data: "button3" },
  //     ],
  //     [
  //       { text: "Button 4", callback_data: "button4" },
  //       { text: "Button 5", callback_data: "button5" },
  //     ],
  //     [{ text: "Button 6", callback_data: "button6" }],
  //   ];
  //   await ctx.reply("Choose inline button:", {
  //     reply_markup: {
  //       inline_keyboard: inlineKeyboard,
  //     },
  //   });
  // }

  // @Action("button2")
  // async onClickButton2(@Ctx() ctx: Context) {
  //   await ctx.reply("Button2 tugmasi bosildi.");
  // }

  // @Action(/button+[1-9]/)
  // async onclickAnyButton(@Ctx() ctx: Context) {
  //   const actText: String = ctx.callbackQuery["data"];
  //   const button_id = Number(actText.split("_")[1]);
  //   // const buttonData = ctx.callbackQuery
  //   // await ctx.reply("Ixtiyoriy tugmasi bosildi.");
  //   await ctx.reply(`Ixtiyoriy Button ${button_id} tugmasi bosildi`);
  // }

  // @Command("main")
  // async mainButton(@Ctx() ctx: Context) {
  //   await ctx.reply("Kerakli Main buttonni tanla", {
  //     parse_mode: "HTML",
  //     ...Markup.keyboard([
  //       ["bir", "ikki", "uch"],
  //       ["to'rt", "besh"],
  //       ["olti"],
  //       [Markup.button.contactRequest("📞 Telefon raqami yuboring")],
  //       [Markup.button.locationRequest("📍 Manzilingizni yuboring")],
  //     ])
  //       .resize()
  //       .oneTime(true),
  //   });
  // }

  // @Action("📍 Manzilingizni yuboring")
  // async onLocationButton(@Ctx() ctx: Context) {
  //   await ctx.reply("hello");
  // }

  // @Hears("bir")
  // async onBirButtonClick(@Ctx() ctx: Context) {
  //   await ctx.reply("Bir tugmasi bosildi");
  // }

  // @Command("help")
  // async commandHelp(@Ctx() ctx: Context) {
  //   await ctx.replyWithHTML(
  //     `<b>start</b> - Botni ishga tushirish,\n<b>stop</b> - Botni to'xtatish,\n<b>help</b> - Ushbu buyruqlarni ko'rsatish`,
  //   );
  // }

  // @On("text")
  // async onText(@Ctx() ctx: Context) {
  //   console.log(ctx);

  //   if ("text" in ctx.message) {
  //     if (ctx.message.text == "salom") {
  //       await ctx.replyWithHTML("<b> Hello </b>");
  //     } else {
  //       await ctx.replyWithHTML(ctx.message.text);
  //     }
  //   }
  // }

  // @On("photo")
  // async onPhoto(@Ctx() ctx: Context) {
  //   if ("photo" in ctx.message) {
  //     console.log(ctx.message.photo);
  //     await ctx.replyWithPhoto(
  //       String(ctx.message.photo[ctx.message.photo.length - 1].file_id),
  //     );
  //   }
  // }

  // @On("video")
  // async onVideo(@Ctx() ctx: Context) {
  //   if ("video" in ctx.message) {
  //     console.log(ctx.message.video);
  //     await ctx.reply(String(ctx.message.video.file_size));
  //   }
  // }

  // @On("sticker")
  // async onSticket(@Ctx() ctx: Context) {
  //   if ("sticker" in ctx.message) {
  //     console.log(ctx.message.sticker);

  //     await ctx.reply("😌");
  //   }
  // }

  // @On("animation")
  // async onAnimation(@Ctx() ctx: Context) {
  //   if ("animation" in ctx.message) {
  //     console.log(ctx.message.animation);

  //     await ctx.reply("😌");
  //   }
  // }

  // @On("contact")
  // async onContact(@Ctx() ctx: Context) {
  //   if ("contact" in ctx.message) {
  //     console.log(ctx.message.contact);
  //     console.log(ctx.message.contact.last_name);
  //   }
  // }

  // @On("location")
  // async onLocation(@Ctx() ctx: Context) {
  //   if ("location" in ctx.message) {
  //     console.log(ctx.message.location);

  //     await ctx.reply(String(ctx.message.location.latitude));
  //     await ctx.reply(String(ctx.message.location.longitude));
  //     await ctx.replyWithLocation(
  //       ctx.message.location.latitude,
  //       ctx.message.location.longitude,
  //     );
  //   }
  // }

  // @On("voice")
  // async onVoice(@Ctx() ctx: Context) {
  //   if ("voice" in ctx.message) {
  //     console.log(ctx.message.voice);

  //     await ctx.reply(String(ctx.message.voice.duration));
  //   }
  // }

  // @On("document")
  // async onDocument(@Ctx() ctx: Context) {
  //   if ("document" in ctx.message) {
  //     console.log(ctx.message.document);

  //     await ctx.reply(String(ctx.message.document.file_size));
  //     await ctx.reply(String(ctx.message.document.file_id));
  //     await ctx.reply(String(ctx.message.document.file_name));
  //   }
  // }

  // @On("message")
  // async onMessage(@Ctx() ctx: Context) {
  //   console.log(ctx.botInfo);
  //   console.log(ctx.chat);
  //   console.log(ctx.chat.id);
  //   console.log(ctx.from);
  //   console.log(ctx.from.first_name);
  // }
}
