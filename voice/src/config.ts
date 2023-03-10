// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

const config = {
    logging: false,

    intentMap: {
        'AMAZON.StopIntent': 'END',
    },

    db: {
        FileDb: {
            pathToFile: './../../db/db.json',
        },
    },
};

export = config;
