const express = require('express')
const Item = require('../models/Item')
const Auction = require('../models/Auction')
const router = express.Router()
const startingChecks = require('../validations/expired')
const joi = require('joi')


// const Items = require ('../models/Item')

const verifyToken = require('../verifyToken')

//get all items
router.get('/', verifyToken, async(req,res)=>{
    try{
    const items = await Item.find()
    res.send(items)
    } catch(err){
        res.status(400).send({message:err})
    }
})

//get individual item
router.get('/itemDetails', verifyToken, async(req,res)=>{
    try{
    const items = await Item.findOne({"item_identifier":req.body.item_identifier})
    res.send(items)
    } catch(err){
        res.status(400).send({message:err})
    }
})


//get items on auction
router.get('/auction', verifyToken, async(req,res)=>{
    const checkup = await startingChecks.expiredItemCheck()
    console.log(checkup)
    try{
    const auctions = await Auction.find()
        res.send(auctions)
    } catch(err){
        res.status(400).send({message:err})
    }
})
//gets all of the bids for an expired/sold item
router.get('/bidhistory', verifyToken, async(req,res)=>{
    const checkup = await startingChecks.expiredItemCheck()
    const auction = await Auction.findOne({auction_identifier:req.body.item_identifier})
    if(auction.auction_status != "expired"){
        res.status(400).send("Auction has not finished")
    }
    else{
        try{
        
        var history = auction.auction_bids
            res.send(history)
        } catch(err){
            res.status(400).send({message:err})
        }
    }
})

//upload item and automatically create auction for that item
router.post('/upload', verifyToken, async(req,res)=>{

    //requests validation to check user input
    const itemExists = await Item.findOne({item_identifier:req.body.item_identifier})

    //check if item identifier is unique
    if(itemExists){
        res.status(400).send("Item identifier is taken")
    }
    else if(!req.header.email){
        res.status(400).send("No email/user provided in header")
    }
    else{
        //code to insert data
        const item = new Item({
            item_identifier:req.body.item_identifier,
            item_title:req.body.item_title,
            item_timestamp:req.body.item_timestamp,
            item_condition:req.body.item_condition,
            item_description:req.body.item_description,
            item_expiration:req.body.item_expiration,
            item_ownerInfo:req.headers.user    
        })
        try{
            const savedItem = await item.save()
            

            const auction = new Auction({
                auction_identifier:req.body.item_identifier,
                auction_bidPrice:0,
                auction_bidUser:"user that bids placeholder",
                auction_status:"open for offers",
                auction_timeToCompletion:1000,
                auction_winner:"winne4r placeholder"  
            })
            const savedAuction = await auction.save()

            res.send(savedAuction)
        }
        catch(err){
            res.status(400).send({message:err})
        }
}
})

// bid on a live auction, price must be higher than current winning price
router.post('/bid', verifyToken, async(req,res)=>{

    const checkup = await startingChecks.expiredItemCheck()

    //code to insert data
    const auctionExists = await Auction.findOne({auction_identifier:req.body.auction_identifier})

    const userOwnsProduct = await Item.findOne({item_identifier:req.body.auction_identifier})

    //check auction exisits
    if(!auctionExists){
        return res.status(400).send({message: "Auction doesn't exist"})
    }
     //check item is not expired
     else if(auctionExists.auction_status == "expired"){
        return res.status(400).send({message: "Auction has expired"})
    }
    //check user is provided in headers
    else if(!req.headers.user){
        return res.status(400).send({message: "You need to provide a user in headers"})
    }
    //check user is not bidding on their own item
    else if(userOwnsProduct.item_ownerInfo == req.headers.user){
        return res.status(400).send({message: "Item poster can't bid on their own item"})
    }
    else{
        const bidPrice = req.body.auction_bidPrice;
        const currentPrice = auctionExists.auction_bidPrice;

        if(bidPrice <= currentPrice){
            return res.status(400).send({message: "Bid price lower than current highest bid"})
        }
        else{
            try{
                var bids = auctionExists.auction_bids
                var email = req.headers.user
                bids.push({bidder:req.headers.user, price:req.body.auction_bidPrice})
                const savedAuction = await Auction.findOneAndUpdate(
                    {"auction_identifier":req.body.auction_identifier},
                    {"auction_bidPrice":req.body.auction_bidPrice, "auction_winner":req.headers.user, "auction_bids":bids})
                
                res.send(savedAuction)
            }
            catch(err){
                res.status(400).send({message:err})
            }
        }
        }

})




module.exports = router