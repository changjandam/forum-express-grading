const express = require('express')
const handlebars = require('express-handlebars')
const db = require('./models')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const helpers = require('./_helpers')
const app = express()
const port = process.env.PORT || 3000

if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config
}

app.engine('hbs', handlebars({ 
  defaultLayout: 'main', 
  extname: '.hbs',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'hbs')

app.use('/upload', express.static(__dirname+'/upload'))

app.use(express.urlencoded({ extended: true }))

app.use(session({secret: 'secret', resave: false, saveUninitialized: false}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.user = helpers.getUser(req)
  next()
})

app.use(methodOverride('_method'))

app.listen(port, () => {
  db.sequelize.sync()
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app, passport)

module.exports = app
