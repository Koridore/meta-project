import { Command, Kottu } from '@struct';
import { ChatInputCommandInteraction } from 'discord.js';
import kills from 'assets/kill.json';
export default class Kill extends Command {
    constructor(kottu: Kottu) {
        super(kottu, {
            name: 'kill',
            description: 'brutally assassinate your friends',
            options: [
                {
                    type: 6,
                    name: 'user',
                    description: 'The target',
                    required: true,
                },
            ],
        });
    }
    public execute(interaction: ChatInputCommandInteraction<'cached'>) {
        const { target, user } = this.getUser(interaction);
        if (!target || !user) {
            return interaction.reply('An unexpected error occurred!');
        }
        if (user?.id === target?.id) {
            this.reply(interaction, {
                content: 'Suicide is not an option!',
                ephemeral: true,
            });
            return Promise.resolve();
        }
        const phrase = this.randomElement(kills);
        let str = phrase as string;
        str = str
            .replace(/\$author/g, user.username)
            .replace(/\$mention/g, target.username);
        this.reply(interaction, { content: str });
        return Promise.resolve();
    }
}
