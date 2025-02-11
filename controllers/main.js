const environment     = process.env.NODE_ENV || 'development';    // set environment
const bcrypt          = require('bcrypt')                         // bcrypt will encrypt passwords to be saved in db
const crypto          = require('crypto');                         // built-in encryption node module
const { query } = require('express');

  //USER AUTH SECTION  

  // app/models/user.js
  const signup = (req, res, db) => {
    const user = req.body
    if(!user || !user.password || !user.username || user.preferredworkinghourperday === undefined) {
      res.json({dbError: 'Bad sign up'})
      return
    }
    user.isAdmin = false;
    user.isManager = false;
    findUser(user, db)
      .then(foundUser => {
        if(!foundUser.username && user && user.password){
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
        } else {
          res.json({dbError: 'User exists'})
        }
      })
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
      "INSERT INTO users (username, password_digest, token, created_at, isAdmin, isManager, preferredworkinghourperday) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING username, created_at, token, preferredworkinghourperday",
      [user.username, user.password_digest, user.token, new Date(), user.isAdmin, user.isManager, user.preferredworkinghourperday]
    )
    .then((data) => data.rows[0])
  }

  // crypto ships with node - we're leveraging it to create a random, secure token
  const createToken = () => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, data) => {
        err ? reject(err) : resolve(data.toString('hex'))
      })
    })
  }


  const signin = (req, res, db) => {
    const userReq = req.body
    let user

    if(!userReq || !userReq.password || !userReq.username){
      res.json({dbError: 'Bad sign in'})
      return      
    }

    findUser(userReq, db)
      .then(foundUser => {
        if(foundUser.dbError){
          return foundUser
        }
        user = foundUser
        return checkPassword(userReq.password, foundUser)
      })
      .then((res) => {
        if(!res.dbError){
          return createToken()
        } else {
          return res
        }
      })
      .then(token => {
        if(!token.dbError){
          updateUserToken(token, user, db)
          user.token = token
        } 
        return token  
      })
      .then(token => {
        if(!token.dbError){
          delete user.password_digest
          res.status(200).json(user)  
        } else {
          res.json(token)
        }
      })
      .catch((err) => console.error(err))
  }

    // app/models/user.js
  const findUser = (userReq, db) => {
    return db.raw("SELECT * FROM users WHERE username = ?", [userReq.username])
      .then((data) => {
        if(data && data.rows && data.rows.length > 0){
          return data.rows[0]
        } else {
          return {dbError: 'No User exists'}
        }
      })
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
    return db.raw("UPDATE users SET token = ? WHERE username = ? RETURNING username, token", [token, user.username])
      .then((data) => data.rows[0])
  }

  const authenticate = (req, res, db, func, needAdmin, needManager) => {
    let token = req.params.token
    let username = req.params.username
    db.select('*').from('users').where('token', '=', token)
    .then(data => {
      if(data.length > 0 && 
        data[0].username === username &&
        (!needAdmin || data[0].isadmin) &&
        (!needManager || data[0].ismanager || data[0].isadmin)){
        func(req, res, db, data[0].isadmin, data[0].ismanager)
      } else {
        res.json({dbError: 'Failed to authenticate'})
      }
    })
  }

  //END USER AUTH SECTION

  //Admin/User Manager section
  
  const getAllUsers = (req, res, db) => {
    authenticate(req, res, db, getAllUsersHelper, false, true)
  }

  const getAllUsersHelper = (req, res, db, isAdmin, isManager) => {
    let query = 'SELECT * FROM users WHERE username != ' + '\'' +  req.params.username + '\''
    if(!isAdmin) {
      query = query + ' AND isadmin = false AND ismanager = false'
    }
    db.raw(query)
    .then(data => {
      if(data.rows.length){
        res.json(data.rows)
      } else {
        res.json({dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({dbError: err}))  
  }


  //End Admin/User Manager Section

  const getTimeEntries = (req, res, db) => {
      authenticate(req, res, db, getTimeEntriesHelper, false, false)
  }

  const getTimeEntriesHelper = (req, res, db, isAdmin, isManager) => {
    db.select('*').from('timeentry').where('username', '=', req.params.username)
    .then(items => {
      if(items.length){
        res.json(items)
      } else {
        res.json({dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({dbError: err}))  
  }

  const deleteUser = (req, res, db) => {
    authenticate(req, res, db, deleteUserHelper, false, true)
  }

  const deleteUserHelper = (req, res, db, isAdmin, isManager) => {
    const { username } = req.body
    if(!username){
      res.json({dbError: 'No user.'})
      return
    }
    //TODO Make it so that managers can't delete other managers/admin users.
    findUser(req.body, db).then(foundUser => {
      if((foundUser.isadmin || foundUser.ismanager) && !isAdmin){
        res.json({dbError: 'Managers cannot delete other managers or admins.'})
      } else {
        db('users').where({username}).del()
        .then(() => {
          res.json({delete: 'true'})
        })
        .catch(err => res.status(400).json({dbError: err}))  
      }
    })
  }

  const deleteTimeEntry = (req, res, db) => {
    authenticate(req, res, db, deleteTimeEntryHelper, false, false)
  }

  const deleteTimeEntryHelper = (req, res, db, isAdmin, isManager) => {
    const { entry_id } = req.body
    db('timeentry').where({entry_id}).del()
      .then(() => {
        res.json({delete: 'true'})
      })
      .catch(err => res.status(400).json({dbError: err}))
  }

  const postTimeEntry = (req, res, db) => {
    authenticate(req, res, db, postTimeEntryHelper, false, false)
  }

  const postTimeEntryHelper = (req, res, db, isAdmin, isManager) => {
    let date
    const { username, hours, workedon, note1, note2, note3 } = req.body
    date = req.body.date ? new Date(req.body.date) : new Date()
    date = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    db('timeentry').insert({ username, hours, workedon, date, note1, note2, note3 })
      .returning('*')
      .then(timeEntry => {
        res.json(timeEntry)
      })
      .catch(err => res.status(400).json({dbError: err}))
  }

  const putTimeEntry = (req, res, db) => {
    authenticate(req, res, db, putTimeEntryHelper, false, false)
  }


  const putTimeEntryHelper = (req, res, db, isAdmin, isManager) => {
    let date
    const { entry_id, hours, workedon, note1, note2, note3 } = req.body
    date = req.body.date ? new Date(req.body.date) : new Date()
    date = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    db('timeentry').where({entry_id}).update({hours, workedon, date, note1, note2, note3})
      .returning('*')
      .then(item => {
        res.json(item)
      })
      .catch(err => res.status(400).json({dbError: 'db error'}))
  }

  const putUser = (req, res, db) => {
    authenticate(req, res, db, putUserHelper, false, false)
  }


  const putUserHelper = (req, res, db, isAdmin, isManager) => {
    let password_digest
    const { username, password, preferredworkinghourperday, currentUserName} = req.body
    if(!isManager && !isAdmin && currentUserName != req.params.username){
      res.json({dbError: 'Tried to update user without permission'})
      return
    }
    let changePass = password != ''
    let query = changePass ? "UPDATE users SET username = ?, password_digest = ?, preferredworkinghourperday = ? WHERE username = ? RETURNING username, token, preferredworkinghourperday, isadmin, ismanager, created_at" : 
                             "UPDATE users SET username = ?, preferredworkinghourperday = ? WHERE username = ? RETURNING username, token, preferredworkinghourperday, isadmin, ismanager, created_at"
    hashPassword(password)
    .then((hashedPassword) => {
      delete password
      password_digest = hashedPassword
    })
    .then(() => {
      db.raw(query, changePass ? [username, password_digest, preferredworkinghourperday, currentUserName] : [username, preferredworkinghourperday, currentUserName])
        //db('users').where({username: currentUserName}).update({username, password_digest, preferredworkinghourperday})
        //.returning('*')
        .then(item => {
          res.json(item)
        })
        .catch(err => res.status(400).json({dbError: err}))
    })
  }


  module.exports = {
    signup,
    signin,
    getTimeEntries,
    deleteTimeEntry,
    postTimeEntry,
    putTimeEntry,
    getAllUsers,
    deleteUser,
    putUser
  }
  