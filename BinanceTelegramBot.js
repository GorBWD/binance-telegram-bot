const request = require('got');
const { Telegraf } = require('telegraf');
const { BACKEND_URL, BOT_TOKEN } = require('./config');
const { objToString } = require('./utils');

class BinanceTelegramBot extends Telegraf {

    constructor(token) {
        super(token);

        this.enableLogging();
        this.registerCommands();
        this.launch();
    }

    enableLogging() {
        this.use(Telegraf.log());
    }

    registerCommands() {
        this.command('init', this.onInitCommand.bind(this));
        this.command('destroy', this.onDestroyCommand.bind(this));
        this.command('getAllTradingPairs', this.onGetAllTradingPairsCommand.bind(this));
        this.command('createAlert', this.onCreateAlertCommand.bind(this));
        this.command('alertPull', this.onAlertPullCommand.bind(this));
    }

    async onInitCommand(ctx) {
        const [ api_key, api_secret ] = ctx.message.text.split(" ").slice(1);

        if ( !api_key || !api_secret ) {
            return ctx.reply('Please provide valid command: /init API_KEY API_SECRET');
        }
        try {

            const res = await request.get(`${BACKEND_URL}/api/init`, {
                query: {
                    api_key,
                    api_secret
                },
                json: true
            });

            const resBody = res.body;
            const token = resBody.token;
                
            return ctx.reply(`Your token is: ${token}`);
        } catch (err) {
            return this.onCommandError(ctx, err); 
        }
    }

    async onGetAllTradingPairsCommand(ctx) {
        try {
            const [ token ] = ctx.message.text.split(" ").slice(1);
            
            const res = await request.get(`${BACKEND_URL}/api/getAllTradingPairs`, {
                query: {
                    token
                },
                json: true
            });
            
            const pricesStr = objToString(res.body);

            ctx.telegram.sendDocument(ctx.from.id, {
                source: Buffer.from(pricesStr),
                filename: 'treading-pairs.csv'
            });
        } catch (err) {
            this.onCommandError(ctx, err);
        }
    }

    async onCreateAlertCommand(ctx) {
        const [ token, pair, min, max ] = ctx.message.text.split(" ").slice(1);

        await request.post(`${BACKEND_URL}/api/createAlert`, {
            body: {
                token, pair, min, max
            },
            json: true
        });

        ctx.reply('Alert Successfully Created!');
    }

    async onAlertPullCommand(ctx) {
        const [ token ] = ctx.message.text.split(" ").slice(1);

        const res = request.stream(`${BACKEND_URL}/api/alertPull`, {
            query: {
                token
            }
        });

        res.on('data', (buf) => {
            const msg = Buffer.from(buf).toString('utf8');
            const regExp = new RegExp(/event: alert\ndata: (.*)/);
            const data = regExp.exec(msg) || [];
            const result = data[1] || null;

            if ( result ) {
                ctx.reply(result);
            }
        });

        // Automaticly destroy long polling in 100 sec
        setTimeout(() => {
            res.destroy();
        }, 100000);
    }

    async onDestroyCommand(ctx) {
        const [ token ] = ctx.message.text.split(" ").slice(1);
            
        await request.delete(`${BACKEND_URL}/api/destroy`, {
            query: {
                token
            },
            json: true
        });
        
        ctx.reply('destroyed');
    }

    onCommandError(ctx, err) {
        if ( err?.name == 'HTTPError' ) {
            switch ( err.statusCode || 500 ) {
                case 422: {
                    return ctx.reply(err.body.message);
                }
    
                default: {
                    return ctx.reply('Something went wrong, please try again.');
                }
            }
        }

        ctx.reply('Something went wrong.');
    }
}

module.exports = new BinanceTelegramBot(BOT_TOKEN);
