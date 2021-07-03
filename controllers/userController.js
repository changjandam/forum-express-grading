const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

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

  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(res.redirect('back'))
  },

  deleteLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(like => {
      like.destroy()
        .then(res.redirect('back'))
    })
  },

  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user =>({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  }

}

module.exports = userController