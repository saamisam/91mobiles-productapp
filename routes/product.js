const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const category = require('../models/Category');
const tag = require('../models/tag');
const config = require('../config/database');
const multer = require('multer');
const upload = multer({dest: 'public/uploads/'});
const fs = require('fs');
const session = require('express-session');
const csv = require('fast-csv');
const mongoose = require('mongoose');
const async = require('async');

router.get('/getsession', (req,res,next) => {
    req.session.categorydata = [];
    req.session.tagdata = [];
    category.getCategory((err, categorydata ) => {
        tag.getTag((err, tagdata) => {
            req.session.categorydata = categorydata;
            req.session.tagdata = tagdata;
            req.session.save();
            res.json({success: true, msg: 'Category Data.', session: req.session});
        })
    });
})

// router.get('/gettag', (req,res,next) => {
//     // req.session.tagdata = [];
//     tag.getTag((err, tagdata) => {
//         // req.session.tagdata = tagdata;
//         res.send({success: true, msg: 'Tag Data.', tag: tagdata});
//     })
// })

router.get('/getProducts',(req,res,next) => {
    res.json({success: true, msg: 'Product List.', product: req.session.data});
})

router.delete('/deleteproduct/:id',(req,res,next) => {
    if (!req.session.data)  req.session.data = [];
    Product.deleteProduct(req.params.id, (err,product) => {
        if(err) throw err;
        req.session.data = req.session.data.filter((product) => {
            return product._id != req.params.id; 
        });
        res.json({success: true, msg: 'Product deleted.', product: req.session.data})
    })
})



router.post('/addproduct', upload.any(), (req, res, next) => {
    if (!req.session.data)  req.session.data = [];

    if(req.files){
        req.files.forEach(function(file){
            var filename = (new Date).valueOf()+"-"+file.originalname;
            fs.rename(file.path, 'public/uploads/'+filename,(err)=>{
                if(err)throw err;
                let newProduct = new Product({
                    name : req.body.name,
                    categoryId: req.body.categoryId,
                    mrp: req.body.mrp,
                    stockStatus: req.body.stockStatus,
                    description: req.body.description,
                    image: filename,
                    tagId: req.body.tagId
                });
            
                Product.addProduct(newProduct, (err, product) => {
                    if(err)
                        res.json({success: false, msg: 'Failed to add product.', err: err});
                    else{
                        return new Promise((resolve,reject)=>{
                            if(product)
                                return resolve(product);
                            else    
                                return reject();
                        }, function(err) {
                            console.log(err);
                        })
                        .then((product) => {
                            product = product.toJSON();
                            return new Promise((resolve,reject)=>{
                                req.session.categorydata.forEach((categorydata)=>{
                                    if(product.categoryId == categorydata._id){
                                        product["category"] = categorydata.category;
                                        return;
                                    }
                                });
                                req.session.tagdata.forEach((tagdata)=>{
                                    if(product.tagId == tagdata._id){
                                        product["tag"] = tagdata.Tag;
                                        return;
                                    }
                                }); 
                                if(product)
                                    return resolve(product);
                                else    
                                    return reject();
                            });
                        }, function(err) {
                            console.log(err);
                        })
                        .then((product) => {
                            req.session.data.push(product);
                            res.json({success: true, msg: 'Product Added.', product: req.session.data})
                        }, function(err) {
                            console.log(err);
                        })
                        
                    }
                });
            })
        })
    }
});

router.post('/uploadcsv', upload.any(), (req, res, next) => {
    if (!req.session.data) req.session.data = [];
    if(req.files){
        let products = [];
        req.files.forEach(function(file){
            let filename = (new Date).valueOf()+"-"+file.originalname;
            fs.rename(file.path, 'public/uploads/'+filename,(err)=>{
                var stream = fs.createReadStream('public/uploads/'+filename);
                csv
                .fromStream(stream)
                .on("data", function(data){
                    var newProduct = new Product({
                        categoryId: data[0],
                        description: data[1],
                        image: data[2],
                        mrp: data[3],
                        name:data[4],
                        stockStatus:data[5],
                        tagId:data[6]
                    });
                    newProductJson = newProduct.toJSON();
                    req.session.categorydata.forEach((categorydata)=>{
                        if(newProductJson.categoryId == categorydata._id){
                            newProductJson['category'] = categorydata.category;
                            return;
                        }
                    });
                    req.session.tagdata.forEach((tagdata)=>{
                        if(newProductJson.tagId == tagdata._id){
                            newProductJson['tag'] = tagdata.Tag;
                            return;
                        }
                    });
                    req.session.data.push(newProductJson);
                    products.push(newProduct);
                })
                .on("end", function(){
                    products.forEach((newProduct) => {
                        Product.addProduct(newProduct);
                    })
                    res.json({success: true, msg: 'CSV imported Successfully.', product: req.session.data});
                });
            })
        })
    }else{
        return res.json({success: false, msg: 'No files were uploaded.'});
    }
})

module.exports = router;
