const { string } = require('joi')
const timespan = require('jsonwebtoken/lib/timespan')
const mongoose = require('mongoose')

const auctionSchema = mongoose.Schema({
    auction_identifier:{
        type:String,
        require:true,
        min:3,
        max:26
    },
    auction_bidPrice:{
        type:Number
        // require:true
    },
    auction_bidUser:{
        type:String,
        require:true
    },
    auction_status:{
        type:String
    },
    item_expiration:{
        type:Date
    },
    auction_timeToCompletion:{
        type:String
    },
    auction_winner:{
        type:String
    },
    auction_bids: {
        type:[]
      }

})

module.exports = mongoose.model('auctions', auctionSchema)
