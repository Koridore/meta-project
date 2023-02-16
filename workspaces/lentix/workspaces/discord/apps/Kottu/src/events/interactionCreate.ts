import { Events, Interaction } from 'discord.js';
import { PermissionLevel } from 'enums';
import Event from '@struct/Event';
import Kottu from '@struct/Kottu';
import PrismaClient from '../prisma';
export default new Event(
    Events.InteractionCreate,
    async (kottu: Kottu, interaction: Interaction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;
        if (interaction.isChatInputCommand()) {
            const data = await PrismaClient.guild.findUnique({
                where: { id: interaction.guild.id },
            });
            if (!data) return;
            if (data.blacklisted) return;

            const command = kottu.commands.get(interaction.commandName);

            if (!command) {
                await interaction.reply('This command is unavailable!');
                Promise.resolve();
            }
            if (
                command?.permissions === PermissionLevel.Owner &&
                interaction.user.id !== kottu.ownerId
            )
                return;
            if (
                command?.permissions === PermissionLevel.Admin &&
                !interaction.member.roles.cache.has(data.adminRole)
            ) {
                interaction.reply('You are no admin!');
                return Promise.resolve();
            }
            try {
                command?.execute(interaction).then(() => {
                    const subCommand = command.options.find(
                        (f) =>
                            f.type === 1 &&
                            f.name === interaction.options.getSubcommand(),
                    );
                    if (subCommand)
                        return (
                            command[
                                subCommand.name as keyof typeof command
                                // eslint-disable-next-line @typescript-eslint/ban-types
                            ] as Function
                        )(interaction);
                });
            } catch (err) {
                if (err instanceof Error) {
                    kottu.logger.error(err.stack);
                } else kottu.logger.error(err);
            }
        }
    },
);
