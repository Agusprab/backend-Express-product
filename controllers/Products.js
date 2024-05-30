import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize"



export const getProducts = async (req, res) => {
    try {
        let response;
        if(req.role === "admin"){
            response = await Product.findAll({
                attributes:['uuid','name','price'],
                include: [{
                    model: User,
                    attributes: ['name','email']
                }]
            });        
        }else{
            response = await Product.findAll({
                attributes:['uuid','name','price'],
                where: {
                    userId: req.userId
                }
                ,include: [{
                    model: User,
                    attributes: ['name','email']
                }]
            }); 
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }

}

export const getProductsById = async(req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Product Tidak Ditemukan"});
        let response;
        if(req.role === "admin"){
            response = await Product.findOne({
                attributes:['uuid','name','price'],
                where: {
                    id: product.id
                },
                include: [{
                    model: User,
                    attributes: ['name','email']
                }]
            });        
        }else{
            response = await Product.findOne({
                attributes:['uuid','name','price'],
                where: {
                    [Op.and]:[{id:product.id}, { userId: req.userId}]                   
                }
                ,include: [{
                    model: User,
                    attributes: ['name','email']
                }]
            }); 
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createProducts = async (req, res) => {
    const {name, price} = req.body;
    try {
        await Product.create({
            name: name,
            price: price,
            userId: req.userId
        });
        res.status(201).json({msg: "Product Created"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }

}

export const updateProducts = async (req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Product Tidak Ditemukan"});
        const {name, price} = req.body;
        if(req.role === "admin"){
              await Product.update({name,price},{
                where: {
                    id: product.id
                }
              })   
        }else{
            if(req.userId !== product.userId) return res.status(403).json({msg: "Akses Terlarang"});
            await Product.update({name,price},{
                where: {
                    [Op.and]:[{id:product.id}, { userId: req.userId}]                   
                }
              })          
        }
        res.status(200).json({msg: "Product Updated"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const deleteProducts = async(req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Product Tidak Ditemukan"});
        if(req.role === "admin"){
              await Product.destroy({
                where: {
                    id: product.id
                }
              })   
        }else{
            if(req.userId !== product.userId) return res.status(403).json({msg: "Akses Terlarang"});
            await Product.destroy({
                where: {
                    [Op.and]:[{id:product.id}, { userId: req.userId}]                   
                }
              })          
        }
        res.status(200).json({msg: "Product Deleted"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}