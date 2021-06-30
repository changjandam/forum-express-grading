const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Comment = db.Comment
const Restaurant = db.Restaurant

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_msg', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_msg', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10, null)
          }).then(user => {
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInpage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_msg', '登入成功！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_msg', '登出成功！')
    req.logout()
    res.redirect('signin')
  },

  //TODO: 
  getUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      Comment.findAll({
        raw: true,
        nest: true,
        where: {
          UserId: user.id
        }
      }).then(comments => {
        Promise.all(
          comments.map(comment => {
            return Restaurant.findByPk(comment.RestaurantId)
              .then(restaurant => {
                comment.restaurantName = restaurant.name
                comment.restaurantImage = restaurant.image
              })
          })
        ).then(() => {
          const length = comments.length
          return res.render('profile', { user: user.toJSON(), comments, length })
        })
      })
    })
  },

  editUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return res.render('editProfile', { user: user.toJSON() })
    })
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_msg', 'Please enter your name.')
      return res.redirect('back')
    }
    const { file } = req
    if (!file) {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name
          })
        })
        .then(() => {
          req.flash('success_msg', 'Profile was updated successfully.')
          res.redirect(`/users/${req.body.id}`)
        })
    }

    imgur.setClientID(IMGUR_CLIENT_ID);
    imgur.upload(file.path, (err, img) => {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            image: file ? img.data.link : user.image
          })
        })
        .then((user) => {
          req.flash('success_msg', 'Profile was updated successfully.')
          res.redirect(`/users/${req.body.id}`)
        })
    })

  }

}

module.exports = userController