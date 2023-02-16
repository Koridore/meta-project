import Command from '@struct/Command';
import Kottu from '@struct/Kottu';
import { CommandType } from 'enums';
import { ChatInputCommandInteraction } from 'discord.js';
export default class Ping extends Command {
    constructor(kottu: Kottu) {
        super(kottu, {
            name: 'ping',
            description: "Get the bot's latency",
            type: CommandType.Info,
        });
    }
    public execute(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
        interaction.reply(`Latency: \`${interaction.client.ws.ping}ms\``);
        return Promise.resolve();
    }
}
