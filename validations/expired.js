const Item = require('../models/Item')
const Auction = require('../models/Auction');
const { array } = require('joi');
const express = require('express')


// const savedAuction = Auction;

async function itemCheck(){
    //sets requirements for the dat sent by user
    const updatedList = []
    var auctions = await Auction.find()
    var items = await Item.find()
    var savedAuction = "";
    var check = "not working"
    try {

        items.forEach(async (element) => {
            //add date comparison then add to updateList.. then go through and add 
            var currentDate = new Date().toISOString()
            var expDate = element.item_expiration.toISOString()
            if (expDate < currentDate) { 
                updatedList.push(element.item_identifier)
            }
            
        });
    } catch (error) {
        console.log(error)
    }

    try {

        auctions.forEach(async (element) => {
            //add date comparison then add to updateList.. then go through and add 
            if (updatedList.includes(element.auction_identifier)) { 
                //update status
                element.auction_status = "expired";
                element.save();
            }
        });
    } catch (error) {
        console.log(error)
    }
    

    return updatedList
}

module.exports.expiredItemCheck = itemCheck