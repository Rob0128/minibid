const { required } = require('joi')
const mongoose = require('mongoose')
const User = require('./User')

const itemSchema = mongoose.Schema({
    item_identifier:{
        type:String,
        require:true,
        min:3,
        max:50
    },
    item_title:{
        type:String,
        require:true,
        min:3,
        max:26
    },
    item_timestamp:{
        type:Date,
        default:Date.now(),
        require:true
    },
    item_condition:{
        type:String
    },
    item_description:{
        type:String
    },
    item_expiration:{
        type:Date,
        require:true
        
    },
    item_ownerInfo:{
        type:String,
        default:this.User,
        require:true
    }

})

module.exports = mongoose.model('items', itemSchema)
