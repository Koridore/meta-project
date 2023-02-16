import { Kottu, Module } from '@struct';
import {
    ChatInputCommandInteraction,
    Interaction,
    TextChannel,
} from 'discord.js';
import { ButtonCustomIds } from 'enums';
import { ITabooCard } from 'types';
//import { ITabooGame } from 'types';
import Taboo from './Taboo';
import cards from 'assets/tabooCards.json';
export default class TabooModule extends Module {
    public module: string;
    public friendlyName: string;
    public games: Record<string, Taboo>;
    constructor(kottu: Kottu) {
        super(kottu);
        this.module = 'taboo';
        this.games = {};
    }
    start(interaction: ChatInputCommandInteraction<'cached'>) {
        if (this.games[interaction.channelId])
            return Promise.resolve('A game already exists on this channel!');
        this.games[interaction.channelId] = new Taboo(
            this,
            this.kottu,
            interaction.channel as TextChannel,
        );
        return Promise.resolve('Starting game...');
    }
    stop(interaction: ChatInputCommandInteraction<'cached'>) {
        if (!this.games[interaction.channelId])
            return Promise.reject('A game does not exist in this channel!');
        const game = this.games[interaction.channelId];
        try {
            game.endGame();
            clearTimeout(game.time);
            Promise.resolve('Successfully stopped the running game!');
        } catch (err) {
            this.logError(err);
        }
    }
    interactionCreate(interaction: Interaction) {
        if (!interaction.inCachedGuild()) return;
        if (!interaction.isButton()) return;
        if (interaction.customId !== ButtonCustomIds.TABOO_ENTRY) return;
        if (!this.games[interaction.channelId])
            return interaction.reply({
                content: 'An unexpected error occurred',
                ephemeral: true,
            });
        this.games[interaction.channelId].interactionHandler(
            interaction.user,
            interaction,
        );
    }
    getCard(): ITabooCard {
        const card = this.randomElement(cards);
        return { word: card.word, banned: card.taboo };
    }
}
