import * as fs from 'fs';
import * as path from 'path';
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

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN || '';
const SECRET = process.env.LINE_ACCESS_SECRET || '';

// Setup all LINE client and Express configurations.
const clientConfig: ClientConfig = {
    channelAccessToken: TOKEN,
};

const middlewareConfig: MiddlewareConfig = {
    channelAccessToken: TOKEN,
    channelSecret: SECRET,
};


const client = new messagingApi.MessagingApiClient(clientConfig);
const USER_MAP = new Map();


function load() {
    const data = fs.readFileSync(path.join(__dirname, 'member.json'), { encoding: 'utf-8' });
    const jsonData = JSON.parse(data);
    console.log(jsonData);
}
load();

// Create a new Express application.
const app: Application = express();

// Function handler to receive the text.
const textEventHandler = async (event: webhook.Event): Promise<MessageAPIResponseBase | undefined> => {
    // Process all variables here.
    if (event.type !== 'message') {
        return;
    }
    
    // it must be message event
    const messageEvent = event as webhook.MessageEvent;
    if (!messageEvent.message || (messageEvent.message!.type !== 'text')) {
        return;
    }

    // it must be in group
    if (!event.source || !(event.source as webhook.GroupSource).groupId) {
        return;
    }
    const eventSoruce = messageEvent.source! as webhook.GroupSource;

    const messageContent = messageEvent.message! as webhook.TextMessageContent;

    // Process all message related variables here.
    // Create a new message.
    // Reply to the user.
    // await client.pushMessage({
    //     to: eventSoruce.groupId,
    //     messages: [{
    //         type: "text",
    //         text: messageContent.text
    //     }]
    // });
    await client.replyMessage({
        replyToken: messageEvent.replyToken!,
        notificationDisabled: true,
        messages: [{
            replyToken: messageEvent.replyToken!,
            quoteToken: messageContent.quoteToken!,
            type: "text",
            text: "收到",
        }],
    })
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