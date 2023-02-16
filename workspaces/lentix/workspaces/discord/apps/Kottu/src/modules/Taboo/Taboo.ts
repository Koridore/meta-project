import { Base, Kottu } from '@struct';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    chatInputApplicationCommandMention,
    EmbedBuilder,
    Guild,
    TextChannel,
    User,
} from 'discord.js';
import { ITabooPlayerData, ITabooCard } from 'types';
import { stripIndents } from 'common-tags';
import { ButtonCustomIds, Color } from 'enums';
import TabooModule from '.';
export default class Taboo extends Base {
    public channel: TextChannel;
    public guild: Guild;
    public players: ITabooPlayerData[];
    public index: number;
    public time: NodeJS.Timeout;
    public module: TabooModule;
    public card: ITabooCard;
    constructor(module: TabooModule, kottu: Kottu, channel: TextChannel) {
        super(kottu);
        this.module = module;
        this.channel = channel;
        this.guild = this.channel.guild;
        this.players = [];
        this.index = 0;
        this.card = module.getCard();

        this.entryForm();
    }
    async entryForm() {
        /* ------------------------------------------------------------------------------- */
        const embed = new EmbedBuilder()
            .setColor(Color.Purple)
            .setTitle('A game of taboo has started!')
            .setDescription(stripIndents`
        **Welcome to Taboo!**

        Taboo is all about describing words, with a certain twist. To begin, lets click on the button below! You can always 
        leave by clicking again! The game will start <t:${Math.round(
            Date.now() / 1000 + 60,
        )}:R>!

        Make sure you
        •   Read the rules by running ${chatInputApplicationCommandMention(
            'taboo',
            'info',
            '1057898564568760331',
        )}
        •   Do not try to find exploits
        •   Have fun!
`);
        /* ------------------------------------------------------------------------------- */
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('ENTER')
            .setCustomId(ButtonCustomIds.TABOO_ENTRY);
        const buttonDisabled = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('ENTER')
            .setCustomId(ButtonCustomIds.TABOO_ENTRY)
            .setDisabled(true);
        const component = new ActionRowBuilder<ButtonBuilder>().addComponents(
            button,
        );
        const componentDisabled =
            new ActionRowBuilder<ButtonBuilder>().addComponents(buttonDisabled);
        const msg = await this.channel.send({
            embeds: [embed],
            components: [component],
        });
        setTimeout(() => {
            msg.edit({ components: [componentDisabled] });
            if (this.players.length < 2) {
                this.channel.send({
                    content: 'Less than 2 players. Ending game!',
                });
                return this.endGame();
            }
            this.shuffleArray(this.players);
            this.processRound();
        }, 60e3);
    }
    /**
     *
     * @param id The user's id
     * @returns the index of the user.
     */
    getPlayerIndex(id: string) {
        return this.players.indexOf(
            this.players.find((player) => player.id === id) as ITabooPlayerData,
        );
    }
    /**
     *
     * @param id Why do i do this to myself :,(
     * @returns objects. figure it out yourself.
     */
    getPlayer(id: string) {
        return this.players.find((player) => player.id === id) ?? null;
    }
    addPoints(id: string, points: number) {
        const index = this.getPlayerIndex(id);
        const playerData = this.getPlayer(id) as ITabooPlayerData;
        playerData.points += points;
        this.players[index] = playerData;
    }
    interactionHandler(user: User, interaction: ButtonInteraction<'cached'>) {
        const data = this.players.find((p) => p.id === user.id);
        if (!data) {
            this.players.push({ id: user.id, points: 0 });
            return interaction.reply({
                content: `${user.username} has joined the game!`,
            });
        } else {
            this.players.splice(this.players.indexOf(data), 1);
            return interaction.reply({
                content: `${user.username} has left the game!`,
            });
        }
    }
    async processRound() {
        this.card = this.module.getCard();
        const currentPlayer = this.players[this.index];
        const player = this.channel.guild.members.cache.get(currentPlayer.id);
        if (!player) {
            this.channel.send({
                content: "This player doesn't seem to exist... NEXT PLEASE!",
            });
            return this.endRound();
        }
        const embed = new EmbedBuilder().setColor(Color.White)
            .setDescription(stripIndents`
            **Word**: \`${this.card.word}\`
            **Disallowed**: \`${this.card.banned.join('`, `')}\` 
            `);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Back to channel')
                .setURL(this.channel.url),
        );
        try {
            await player.send({ embeds: [embed], components: [row] });
        } catch (err) {
            this.channel.send(
                `${player.toString()} : Cannot send DMS to this user. Skipping user.`,
            );
            return this.endRound();
        }

        this.channel.send({
            content: `${player.toString()}, word has been sent in DMs. You have a minute to describe your word!`,
        });
        const collector = this.channel.createMessageCollector({ time: 6e4 });
        collector.on('collect', (message) => {
            if (!this.players.find((p) => p.id === message.author.id)) return;
            if (message.author.id === player.id) {
                if (this.ifCardMatches(message.content)) {
                    this.addPoints(player.id, -3);
                    const embed = new EmbedBuilder()
                        .setTitle('You broke the taboo!')
                        .setColor(Color.Red)
                        .setDescription(
                            'For being trash at the game, you receive 💫`-3 points`💫',
                        );
                    this.channel.send({ embeds: [embed] });
                    collector.stop();
                }
            } else {
                if (
                    this.card.word.toLowerCase() ===
                    message.content.toLowerCase()
                ) {
                    this.addPoints(message.author.id, 1);
                    this.addPoints(player.id, 2);
                    this.channel.send({
                        content: stripIndents`
                        Well done! You found out the answer!
                        ${player} receives \`2 points\`.
                        ${message.author.toString()} receives \`1 point\`.
                        `,
                    });
                    collector.stop();
                }
            }
        });
        collector.on('end', () => {
            this.endRound();
        });
    }
    endRound() {
        const embed = new EmbedBuilder()
            .setColor('#BDB76B')
            .setTitle('Round ended!')
            .setDescription(
                stripIndents`
            **Word**: ${this.card.word}
            **Disallowed**: \`${this.card.banned.join('`, `')}\`
            `,
            )
            .setFooter({ text: 'Next round in 10 seconds!' });
        this.channel.send({ embeds: [embed] });
        if (!this.players[this.index + 1]) return this.endGame();
        this.sleep(10e3);
        this.index += 1;
        this.processRound();
    }
    sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            this.time = setTimeout(() => {
                resolve();
            }, ms);
        });
    }
    endGame() {
        delete this.module.games[this.channel.id];
        clearTimeout(this.time);
        const sorted = this.players
            .sort((a, b) => {
                return a.points - b.points;
            })
            .reverse();
        return this.channel.send({
            embeds: [
                new EmbedBuilder().setTitle('Game Ended!')
                    .setDescription(stripIndents`
                    **Points Table**
                    ${sorted
                        .map((p) => `<@${p.id}> : \`${p.points}\``)
                        .join('\n')}                    
                    `),
            ],
        });
    }
    ifCardMatches(string: string) {
        string = string.toLowerCase();
        let validation = false;
        this.card.banned.forEach((word) => {
            if (string.includes(word.toLowerCase())) validation = true;
        });
        return string.includes(this.card.word.toLowerCase()) || validation;
    }
}
