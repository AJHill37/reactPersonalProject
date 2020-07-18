const environment     = process.env.NODE_ENV || 'development';    // set environment
const bcrypt          = require('bcrypt')                         // bcrypt will encrypt passwords to be saved in db
const crypto          = require('crypto')                         // built-in encryption node module


const getTableData = (req, res, db) => {
    db.select('*').from('testtable1')
      .then(items => {
        if(items.length){
          res.json(items)
        } else {
          res.json({dataExists: 'false'})
        }
      })
      .catch(err => res.status(400).json({dbError: 'db error'}))
  }
  
  const postTableData = (req, res, db) => {
    const { first, last, email, phone, location, hobby } = req.body
    const added = new Date()
    db('testtable1').insert({first, last, email, phone, location, hobby, added})
      .returning('*')
      .then(item => {
        res.json(item)
      })
      .catch(err => res.status(400).json({dbError: 'db error'}))
  }
  
  const putTableData = (req, res, db) => {
    const { id, first, last, email, phone, location, hobby } = req.body
    db('testtable1').where({id}).update({first, last, email, phone, location, hobby})
      .returning('*')
      .then(item => {
        res.json(item)
      })
      .catch(err => res.status(400).json({dbError: 'db error'}))
  }
  
  const deleteTableData = (req, res, db) => {
    const { id } = req.body
    db('testtable1').where({id}).del()
      .then(() => {
        res.json({delete: 'true'})
      })
      .catch(err => res.status(400).json({dbError: 'db error'}))
  }
  
  //USER AUTH SECTION

  // app/models/user.js
  const signup = (req, res, db) => {
    const user = req.body
    user.isAdmin = false;
    user.isManager = false;
    user.preferredWorkingHourPerDay = 8;
    hashPassword(user.password)
      .then((hashedPassword) => {
        delete user.password
        user.password_digest = hashedPassword
      })
      .then(() => createToken())
      .then(token => user.token = token)
      .then(() => createUser(user, db))
      .then(user => {
        delete user.password_digest
        res.status(201).json({ user })
      })
      .catch((err) => console.error(err))
  }

  // app/models/user.js
  // check out bcrypt's docs for more info on their hashing function
  const hashPassword = (password) => {
    return new Promise((resolve, reject) =>
      bcrypt.hash(password, 10, (err, hash) => {
        err ? reject(err) : resolve(hash)
      })
    )
  }

  // user will be saved to db - we're explicitly asking postgres to return back helpful info from the row created
  const createUser = (user, db) => {
    return db.raw(
      "INSERT INTO users (username, password_digest, token, created_at, isAdmin, isManager, preferredWorkingHourPerDay) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING username, created_at, token",
      [user.username, user.password_digest, user.token, new Date(), user.isAdmin, user.isManager, user.preferredWorkingHourPerDay]
    )
    .then((data) => data.rows[0])
  }

  // crypto ships with node - we're leveraging it to create a random, secure token
  const createToken = () => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, data) => {
        err ? reject(err) : resolve(data.toString('base64'))
      })
    })
  }


  const signin = (req, res, db) => {
    const userReq = req.body
    let user
  
    findUser(userReq, db)
      .then(foundUser => {
        user = foundUser
        return checkPassword(userReq.password, foundUser)
      })
      .then((res) => createToken())
      .then(token => updateUserToken(token, user, db))
      .then(() => {
        delete user.password_digest
        res.status(200).json(user)
      })
      .catch((err) => console.error(err))
  }

    // app/models/user.js
  const findUser = (userReq, db) => {
    return db.raw("SELECT * FROM users WHERE username = ?", [userReq.username])
      .then((data) => data.rows[0])
  }

  const checkPassword = (reqPassword, foundUser) => {
    return new Promise((resolve, reject) =>
      bcrypt.compare(reqPassword, foundUser.password_digest, (err, res) => {
          if (err) {
            reject(err)
          }
          else if (res) {
            resolve(res)
          } else {
            reject(new Error('Passwords do not match.'))
          }
      })
    )
  }

  const updateUserToken = (token, user, db) => {
    return db.raw("UPDATE users SET token = ? WHERE id = ? RETURNING id, username, token", [token, user.id])
      .then((data) => data.rows[0])
  }

  // app/models/user.js
  const authenticate = (username, token, db) => {
    db.select('*').from('users').where('token', '=', token)
    .then(data => {
      console.log(data.length ? data[0].username === username : false)
      data.length ? data[0].username === username : false
    })
  }
  //END USER AUTH SECTION

//This is currently a mess and desperately needs to be cleaned up but I need to move on.
const getUserTableData = (req, res, db) => {

    let token = req.params.token
    let username = req.params.username
    //authenticate(req.params.username, req.params.token, db)
    db.select('*').from('users').where('token', '=', token)
    .then(data => {
      if(data.length ? data[0].username === username : false){
        testFunc(req,res,db)
      } else {
        res.json({dbError: 'Failed to authenticate'})
      }
    })

    /*
    .then(isAuth => {
      console.log(isAuth)
      if(isAuth){
        testFunc(req,res,db)
      } else {
        res.json({dbError: 'Failed to authenticate'})
      }
    })*/
        
    /*
    let auth = authenticate(req.params.username, req.params.token, db)
    if (auth) {
      db.select('*').from('timeentry').where('username', '=', req.params.username)
      .then(items => {
        if(items.length){
          res.json(items)
        } else {
          res.json({dataExists: 'false'})
        }
      })
      .catch(err => res.status(400).json({dbError: 'db error'}))
    } else {
      res.json({dbError: 'Failed to authenticate'})
    }*/
  }

  const testFunc = (req, res, db) => {
    db.select('*').from('timeentry').where('username', '=', req.params.username)
    .then(items => {
      if(items.length){
        res.json(items)
      } else {
        res.json({dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))  
  }

  module.exports = {
    signup,
    signin,
    getTableData,
    getUserTableData,
    postTableData,
    putTableData,
    deleteTableData
  }
  