import {
    Client,
    type ClientOptions,
    GatewayIntentBits,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
    Routes,
    REST,
    Collection,
} from 'discord.js';
interface Config {
    clientId: string | undefined;
    token: string | undefined;
    ownerId: string | undefined;
    bugReportId: string | undefined;
    production: boolean | undefined;
    guildId: string | undefined;
}
import logger from '../transports/winston';
import { Logger } from 'winston';
import Module from './Module';
import CommandLoader from 'collections/CommandLoader';
import EventLoader from 'collections/EventLoader';
import ModuleLoader from 'collections/ModuleLoader';
//import Event from 'struct/Event';

export default class Kottu {
    public client: Client;
    public clientId: string | undefined;
    public logger: Logger;
    private token: string | undefined;
    public readonly ownerId: string | undefined;
    public readonly guildId: string | undefined;
    public readonly bugReportId: string | undefined;
    public readonly production: boolean | undefined;
    public readonly clientOptions: ClientOptions;
    public body: RESTPostAPIChatInputApplicationCommandsJSONBody[];
    public commands: CommandLoader;
    public events: EventLoader;
    public modules: Collection<string, Module>;

    constructor({
        clientId,
        token,
        ownerId,
        bugReportId,
        production,
        guildId,
    }: Config) {
        this.clientId = clientId;
        this.token = token;
        this.ownerId = ownerId;
        this.bugReportId = bugReportId;
        this.production = production;
        this.guildId = guildId;
        this.logger = logger;

        this.body = [];
    }
    /**
     * initiate client
     * @returns {ThisType}
     */
    async initiate() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
            ],
        });
        this.commands = new CommandLoader(this);
        this.events = new EventLoader(this);
        this.modules = new ModuleLoader(this);
        await this.loadApplicationCommands();
        //.loadModules();

        this.client.login(this.token);
        return this;
    }
    /**
     * Loads all slash commands using REST API
     * @returns {ThisType} `this`
     */
    public async loadApplicationCommands() {
        const applicationCommands =
            this.production === true
                ? Routes.applicationCommands(this.clientId ?? '')
                : Routes.applicationGuildCommands(
                      this.clientId ?? '',
                      this.guildId ?? '',
                  );
        try {
            this.logger.info('Loading application commands!');
            const rest = new REST({ version: '10' }).setToken(this.token ?? '');
            await rest.put(applicationCommands, { body: this.body });
            this.logger.info('Loaded application commands!');
        } catch (err) {
            if (err instanceof Error) this.logger.error(err.stack);
            else this.logger.error(err);
        }
        return this;
    }
}
