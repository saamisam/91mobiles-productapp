const mongoose = require('mongoose');
const config = ('../config/database');

const categorySchema =  mongoose.Schema({
    category: {
        type: String,
        required: true
    }
},{collection: 'Category'})

var category = module.exports = mongoose.model('Category', categorySchema);

module.exports.getCategory = (callback) => {
    category.find().exec(callback);
}

module.exports.getCategoryById = (id,callback) => {
    category.findById(id).exec(callback);
}

