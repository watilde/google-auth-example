const path = require('path')
const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const config = require('./config.json')

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((obj, done) => {
  done(null, obj)
})

passport.use(new GoogleStrategy(
  config.google,
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile)
  }
))

const app = express()
app.use(cookieParser())

// @see https://www.npmjs.com/package/express-session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.resolve(__dirname, '/public')))

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email profile'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => { res.redirect('/') }
)

app.get('/api/auth', function (req, res) {
  res.json(req.user)
})

app.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

app.listen(config.port)
