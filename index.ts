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

console.log(middlewareConfig);
// Create a new Express application.
const app: Application = express();
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// Function handler to receive the text.
const textEventHandler = async (event: webhook.Event): Promise<MessageAPIResponseBase | undefined> => {
    // Process all variables here.
    if (event.type !== 'message') {
        return;
    }
    console.log(event);

    // it must be text
    const messageEvent = event as webhook.MessageEvent;
    if (messageEvent.message || messageEvent.message!.type !== 'text') {
        return;
    }

    const messageContent = messageEvent.message! as webhook.TextMessageContent;

    console.log(messageEvent.message);
    // Process all message related variables here.
    // Create a new message.
    // Reply to the user.
    await client.replyMessage({
        replyToken: event.replyToken as string,
        messages: [{
            type: 'text',
            text: messageContent.text,
        }],
    });
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
                    await textEventHandler(event);
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