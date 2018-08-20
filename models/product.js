const mongoose = require('mongoose');
const config = ('../config/database');

const productSchema =  mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    categoryId: {
        type: String
    },
    mrp: {
        type: Number,
        required: true
    },
    stockStatus: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    tagId: {
        type: String   
    }
})

var product = module.exports = mongoose.model('Product', productSchema);

module.exports.addProduct = (newProduct, callback) => {
    newProduct.save(callback);
}

module.exports.getProducts = (callback) => {
    product.find(callback);
}

module.exports.deleteProduct = (id,callback)=>{
    var query = {_id:id};
    product.deleteOne(query,callback);
}
