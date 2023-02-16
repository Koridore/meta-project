import { Command, Kottu } from '@struct';
import { stripIndents } from 'common-tags';
import {
    ChatInputCommandInteraction,
    InteractionResponse,
    EmbedBuilder,
} from 'discord.js';
import { Color, CommandType } from 'enums';
import TabooModule from 'modules/Taboo';

export default class Taboo extends Command {
    public taboo: TabooModule;
    constructor(kottu: Kottu) {
        super(kottu, {
            name: 'taboo',
            description: 'Manage your taboo games',
            type: CommandType.Fun,
            options: [
                {
                    type: 1,
                    name: 'info',
                    description: 'Get information about how to play',
                    options: [],
                },
                {
                    type: 1,
                    name: 'start',
                    description: 'Start a game of taboo!',
                    options: [],
                },
            ],
        });
    }
    public execute(): Promise<void | InteractionResponse<boolean>> {
        this.taboo = this.kottu.modules.get('TabooModule') as TabooModule;
        return Promise.resolve();
    }
    public info(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void | InteractionResponse<boolean>> {
        const info = stripIndents`
        **How to play Taboo!**

        Taboo is a game of quick thinking and language. You are to describe a word without using a list of 
        other commonly associated words. Describe it well, and you win! Leak the word, and you lose. 

        In this game, each game progresses in rounds, where each player has a chance to play. When it is your turn, you will receive a DM 
        (Make sure DMs are turned on!) and view your given words. Go back to the channel and try to explain the word for everyone else
        to figure out!

        **Rules**
        1. Exploits are forbidden. You should, in no way, find any way to find loopholes when describing a word. This includes but 
        does not limit to: use of different language, spacing it out, breaking the word into smaller words, etc.
        2. Do not use any third-party applications that will aid you in the game, this includes applications that allow for 
        illegal communication between participants, or applications that "automatically" find answers for you.
        3. Do not engage in the use of Direct Messaging to converse and "cheat" the game. 
        4. Voice communication should be forbidden.
        5. Do not engage in any toxic conversation. Any use of slurs, hate speech or other such communication is strictly forbidden.


        Have fun!
        `;
        const embed = new EmbedBuilder()
            .setTitle('Taboo Info!')
            .setDescription(info)
            .setColor(Color.Purple);
        interaction.reply({ embeds: [embed] });
        return Promise.resolve();
    }
    public start(interaction: ChatInputCommandInteraction<'cached'>) {
        this.taboo
            .start(interaction)
            .then((res) => this.reply(interaction, { content: res }))
            .catch(this.logError);
    }
}
