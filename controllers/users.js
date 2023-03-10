// create an instance of express routers
const express= require('express')
const db = require('../models')
const router = express.Router()
const crypto = require('crypto-js')
const bcrypt = require('bcrypt')
const axios = require('axios')


// mount our routes on the router

//GET /users/new -- serves a form to create a new user
router.get('/new', (req, res)=>{
    res.render('users/new.ejs', {
        user: res.locals.user
    })
})

//POST /users -- creates a new user from the form @ /users/new
router.post('/', async (req,res)=>{
    try{
        //based on the info in the req.body find or create a user
        const [newUser, created] = await db.user.findOrCreate({
            where: {
                email: req.body.email
            }
        })
        //if the user is found, redirect user to login
        if (!created) {
            console.log('user exists')
            res.redirect('/users/login?message=Please log in to continue.')
        }else {
            //here we know its a new user
            //hash the supplied password
            const hashedPassword = bcrypt.hashSync(req.body.password, 12)
            //save the user with the new password
            newUser.password = hashedPassword
            await newUser.save() //actually save the new password in db
            //encrypt the new user's id and convert it to a string
            const encryptedId = crypto.AES.encrypt(String(newUser.id), process.env.SECRET)
            const encryptedIdString = encryptedId.toString()
            //place the encrypted id in a cookie
            res.cookie('userId', encryptedIdString)
            //redirect to user's profile
            res.redirect('/users/profile')
        }
    } catch(err){
        console.log(err)
        res.status(500).send('server error🫢')
    }
})

//GET /users/login -- render a login from that POSTs to /users/login
router.get('/login', (req, res)=>{
    res.render('users/login.ejs', {
        message: req.query.message ? req.query.message : null,
        user: res.locals.user
    })
})

//POST /users/login -- ingest data from form rendered @ GET /users/login
router.post('/login', async (req, res)=>{
    try {
        //look up the user based on their email
        const user = await db.user.findOne({
            where: {
                email: req.body.email
            }
        })
        //boilerplate message if login fails
        const badCredentialMessage = 'username or password incorrect'
        if (!user) {
        //if the user isnt found in the db
            res.redirect('/users/login?message=' + badCredentialMessage)
        } else if (!bcrypt.compareSync(req.body.password, user.password)) {
            //if the users supplied password is incorrect
            res.redirect('/users/login?message=' + badCredentialMessage)
        } else {
            //if the user is found and their password matches log them in
            console.log('loggin user in!')
            //encrypt new users id and convert it to a string
            const encryptedId = crypto.AES.encrypt(String(user.id), process.env.SECRET)
            const encryptedIdString = encryptedId.toString()
            //place the encrypted id in a cookie
            res.cookie('userId', encryptedIdString)
            res.redirect('/users/profile')
        }
        //if the users supplied PW is incorrect
        //if the user is found and their password matches log them in

    } catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
})

//GET /users/logout -- clear any cookies and redirect to the homepage
router.get('/logout', (req, res) =>{
    //log the user out by removing the cookie
    //make a get req to /
    res.clearCookie('userId')
    res.redirect('/')
})

//GET /user/profile -- show the user their profile page
router.get('/profile', async (req,res)=>{
    //if the user is not logged in -- they are not allowed to be here
    if(!res.locals.user) {
        res.redirect('/users/login?message=You must authenticate before you are authorized to view this resource!')
    } else {
        //get userId 
        let id = res.locals.user.id
        let faves = await db.favorite.findAll({
            where: {
                userId: id
            }
        })
        let data = []
        let url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=`;
let fullUrl = '';

for (let key in faves) {
  fullUrl = ''
    fullUrl = url + `${faves[key]["recipeId"]}`;
//   console.log(fullUrl)
//   console.log(`${key}: ${faves[key]["recipeId"]}`);
  let response = await axios.get(fullUrl);
//   console.log("data")
        //   console.log(response.data)
    data.push(response.data.meals[0])
}
// console.log(data[0].strMeal)        
res.render('users/profile.ejs', {
            user: res.locals.user,
            data: data
        })
    }
})

// router.post('/comment', async (req, res)=>{
//     try {
//         const createComment = await db.comment.create({
//             userId: req.body.userId,
//             favoriteId: req.body.favoriteId,
//             comment: req.body.comment
//         })
//         res.redirect(`/profile/${req.params.id}`)
//     } catch (error) {
//         console.log('cannot get info', error)
//     }
// })

//export the router
module.exports = router
