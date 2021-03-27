const { Schema, model : Model } = require('mongoose');

const CILENT_STATUSES = {
    ENABLED: 'enabled',
    DISABLED: 'disabled'
};

const schema = new Schema({ 
    api_key: {
        type: String,
        unique: true
    }, 
    api_secret: String,
    token: {
        type: String,
        index: true
    },
    status: {
        type: String,
        enum : Object.values(CILENT_STATUSES),
        default: CILENT_STATUSES.ENABLED
    }
});

class Client extends Model('client', schema) {
    static STATUS = CILENT_STATUSES
}

module.exports = Client;