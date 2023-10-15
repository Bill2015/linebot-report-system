import express, { Application, Request, Response } from 'express';
import {
    ClientConfig,
    MessageAPIResponseBase,
    messagingApi,
    middleware,
    MiddlewareConfig,
    webhook,
} from '@line/bot-sdk';
import 'dotenv/config'
import { ReportSystem } from './report-system'

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN || '';
const SECRET = process.env.LINE_ACCESS_SECRET || '';
const ADMIN_UUID = process.env.ADMIN_UUID || '';
const TARGET_GROUP_UUID = process.env.TARGET_GROUP_UUID || '';

// Setup all LINE client and Express configurations.
const clientConfig: ClientConfig = {
    channelAccessToken: TOKEN,
};

const middlewareConfig: MiddlewareConfig = {
    channelAccessToken: TOKEN,
    channelSecret: SECRET,
};


const client = new messagingApi.MessagingApiClient(clientConfig);
const REPORT_SYSTEM = new ReportSystem();

enum Command {
    REPORTING,
    REPORTING_FAILED,
    RESET,
    FORMAT,
    REMAINING,
    NONE,
}

// Create a new Express application.
const app: Application = express();

function isVailedCommand(event: webhook.Event): boolean {
    if (event.type !== 'message') {
        return false;
    }

    // it must be in text type
    const messageEvent = event as webhook.MessageEvent;
    if (!messageEvent.message || (messageEvent.message!.type !== 'text')) {
        return false;
    }

    // it must be in the group
    if (!event.source || !(event.source as webhook.GroupSource).groupId) {
        return false;
    }

    // it must be have user
    if (!event.source || !(event.source as webhook.GroupSource).userId) {
        return false;
    }

    const messageContent = messageEvent.message! as webhook.TextMessageContent;

    // is command
    if (messageContent.text.startsWith("$") === false) {
        return false;
    }

    console.log(event.source)
 
    // not the target group
    if ((event.source as webhook.GroupSource).groupId !== TARGET_GROUP_UUID) {
        return false;
    }

    return true;
}

function parseCommand(text: string, userUuid: string): Command {
    if (text.startsWith('$')) {
        // static command
        if (userUuid === ADMIN_UUID) {
            if (text === "$reset") {
                return Command.RESET;
            }
            else if (text === "$fmt") {
                return Command.FORMAT;
            }
            else if (text === "$left") {
                return Command.REMAINING;
            }
        }

        // report format
        const regex = new RegExp(/^\$13[0-9]{3}[ ].*$/);
        if (regex.test(text)) {
            return Command.REPORTING;
        }
    }

    return Command.NONE;
}

// Function handler to receive the text.
const textEventHandler = async (event: webhook.Event): Promise<MessageAPIResponseBase | undefined> => {

    if (isVailedCommand(event) === false) {
        return;
    }
    
    // it must be message event
    const messageEvent = event as webhook.MessageEvent;
    const messageContent = messageEvent.message! as webhook.TextMessageContent;

    // reply function
    const replyFn = (msg: string, quote: boolean = true) => client.replyMessage({
        replyToken: messageEvent.replyToken!,
        notificationDisabled: true,
        messages: [{
            replyToken: messageEvent.replyToken!,
            quoteToken: quote ? messageContent.quoteToken! : undefined,
            type: "text",
            text: msg,
        }],
    });

    const userText = messageContent.text;

    const command = parseCommand(userText, messageEvent.source!.userId! as string);
    // execute the commands
    switch (command) {
        // normal user reporting
        case Command.REPORTING:
            const index = userText.indexOf(' ');
            try {
                REPORT_SYSTEM.setUserMsg(userText.slice(1, index), userText.slice(index + 1));
                await replyFn("收到");
            }
            catch (e) {
                await replyFn("編號不存在");
            }
            return;
        
        // normal user report failed
        case Command.REPORTING_FAILED:
            await replyFn("回報格式不符\n格式:\"$<號碼><空白><做甚麼>\"");
            return;

        // format the report result
        case Command.FORMAT:
            await replyFn(REPORT_SYSTEM.format(), false);
            return;

        // format the report result
        case Command.RESET:
            REPORT_SYSTEM.reset();
            await replyFn("Reset 成功");
            return;

        // people who still not reported
        case Command.REMAINING:
            await replyFn(REPORT_SYSTEM.remaining());
            return;        

        case Command.NONE:
            return;
        default:
            break;
    }


};

// Register the LINE middleware.
// As an alternative, you could also pass the middleware in the route handler, which is what is used here.
// app.use(middleware(middlewareConfig));

// Route handler to receive webhook events.
// This route is used to receive connection tests.
app.get('/', async (_: Request, res: Response): Promise<Response> => {
        return res.status(200).json({
            status: 'success',
            message: 'Connected successfully!',
        });
    }
);

// This route is used for the Webhook.
app.post('/webhook', middleware(middlewareConfig),  async (req: Request, res: Response): Promise<Response> => {
        const callbackRequest: webhook.CallbackRequest = req.body;
        const events: webhook.Event[] = callbackRequest.events!;

        // Process all the received events asynchronously.
        const results = await Promise.all(
            events.map(async (event: webhook.Event) => {
                try {
                    return await textEventHandler(event);
                }
                catch (err: unknown) {
                    if (err instanceof Error) {
                        console.error(err);
                    }

                    // Return an error message.
                    return res.status(500).json({
                        status: 'error',
                    });
                }
            })
        );

        // Return a successfull message.
        return res.status(200).json({
            status: 'success',
            results,
        });
    }
);

// Create a server and listen to it.
app.listen(PORT, () => {
    console.log(`Application is live and listening on port ${PORT}`);
});