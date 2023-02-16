import { Command, Kottu } from '@struct';
import Table from 'cli-table3';
import { Collection } from 'discord.js';
import * as events from '../events';

const styling: Table.TableConstructorOptions = {
    chars: {
        mid: '',
        'left-mid': '',
        'mid-mid': '',
        'right-mid': '',
    },
    style: {
        head: ['yellow'],
    },
};
export default class EventCollection extends Collection<string, Command> {
    public kottu: Kottu;
    constructor(kottu: Kottu) {
        super();
        this.kottu = kottu;
        this.loadCommands();
    }
    loadCommands() {
        const table = new Table({
            head: ['Name', 'Status'],
            ...styling,
        });
        const values = Object.values(events);
        values.forEach((event) => {
            this.kottu.client.on(event.event, (...args) =>
                event.run(this.kottu, ...(args as never)),
            );
            table.push([event.event.toString(), '✅']);
            this.kottu.logger.info(
                `[Event] loaded ${event.event.toString()} event`,
            );
        });
        this.kottu.logger.info(`\n${table.toString()}\n`);
        return this;
    }
}
