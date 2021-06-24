const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({raw: true}).then(restaurants => {
      return res.render('admin/restaurants', {restaurants: restaurants})
    })
  },

  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },

  postRestaurant: (req, res) => {
    if(!req.body.name) {
      req.flash('error_msg', "name didn't exist")
      return res.redirect('back')
    }
    return Restaurant.create({
      name: req.body.name,
      tel: req.body.tel,
      address: req.body.address,
      open_hours: req.body.open_hours,
      description: req.body.description
    })
    .then((restaurant) => {
      req.flash('success_msg', 'restaurant was successfully created')
      res.redirect('/admin/restaurants')
    })
    .catch(e => console.log(e))
  }
}
module.exports = adminController