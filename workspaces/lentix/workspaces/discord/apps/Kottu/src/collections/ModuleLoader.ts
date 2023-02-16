import { Kottu, Module } from '@struct';
import { Collection } from 'discord.js';
import * as modules from 'modules';
export default class ModuleCollection extends Collection<string, Module> {
    public kottu: Kottu;
    public events: string[];
    constructor(kottu: Kottu) {
        super();
        this.kottu = kottu;
        this.events = ['interactionCreate'];
        this.loadModules();
    }
    loadModules() {
        this.kottu.logger.info('[Module] Loading modules!');
        const values = Object.values(modules);
        if (!values.length) return;
        values.forEach((Module) => {
            const module = new Module(this.kottu);
            this.set(module.name, module);
            this.events.forEach((event) => {
                if (module[event as keyof typeof module]) {
                    this.kottu.client.on(
                        event,
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        (module[event as keyof typeof module] as Function).bind(
                            module,
                        ),
                    );
                }
            });
            this.kottu.logger.info(`[Module] Loaded ${module.name}`);
        });
    }
}
