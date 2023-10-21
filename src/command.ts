
export enum Command {
    REPORTING,
    REPORTING_FAILED,
    RESET,
    FORMAT,
    REMAINING,
    NONE,
}

export function parseCommand(text: string, userUuid: string, adminUuid: string): Command {
    if (text.startsWith('$')) {
        // static command
        if (userUuid === adminUuid) {
            if (text === "$reset") {
                return Command.RESET;
            }
        }

        if (text === "$fmt") {
            return Command.FORMAT;
        }
        else if (text === "$left") {
            return Command.REMAINING;
        }

        // report format
        const regex = new RegExp(/^\$13[0-9]{3}[ ].*$/);
        if (regex.test(text)) {
            return Command.REPORTING;
        }
    }

    return Command.NONE;
}