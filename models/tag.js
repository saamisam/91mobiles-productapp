const mongoose = require('mongoose');
const config = ('../config/database');

const tagSchema =  mongoose.Schema({
    tag: {
        type: String,
        required: true
    }
},{collection: 'Tag'})

var tag = module.exports = mongoose.model('Tag', tagSchema);
module.exports.getTag = (callback) => {
    tag.find(callback);
}
