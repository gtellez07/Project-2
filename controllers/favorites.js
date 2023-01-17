const express= require('express')
const db = require('../models')
const router = express.Router()
const crypto = require('crypto-js')
const bcrypt = require('bcrypt')
const axios = require('axios')

module.exports = {
    getFavorites, 
    deleteFavorite
}

function getFavorites (id) {    
        let faves = db.favorite.findAll({
            where: {
                userId: id
            }
        })
        return faves
}

function deleteFavorite (rid, uid) {
    let deleteFavorite =  db.favorite.destroy({
        where: { 
          recipeId: rid,
          userId: uid
       },
      });
}