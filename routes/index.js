var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')

var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
	var successMsg = req.flash('success')[0];
	Product.find(function(err, docs) {
		res.render('shop/index', { products: docs, successMsg: successMsg, noMessages: !successMsg });
	});
});

router.get('/add-to-cart/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart: {});

	Product.findById(productId, function(err, product) {
		if (err) {
			return res.redirect('/')
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/');
	});
});

router.get('/shopping-cart', function(req, res, next) {
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', {products: null});
	}
	var cart = new Cart(req.session.cart);
	res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
	var errMsg = req.flash('error')[0];
	res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});


});

router.post('/checkout', isLoggedIn, function(req, res, next) {

	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}

	var cart = new Cart(req.session.cart);

	// Set your secret key: remember to change this to your live secret key in production
	// See your keys here: https://dashboard.stripe.com/account/apikeys
	var stripe = require("stripe")("sk_test_XgQlWzVVvlr0O3DbrKdaE6rl");

	// Get the credit card details submitted by the form
	var token = req.body.stripeToken; // Using Express

	// Create a charge: this will charge the user's card
	var charge = stripe.charges.create({
		amount: cart.totalPrice * 100, // Amount in cents
		currency: "usd",
		source: token,
		description: "Test charge"
	}, function(err, charge) {
	  if (err) {
	  	// The card has been declined
	    req.flash('error', err.message);
	    return redirect('/checkout');
	  }
	  var order = new Order({
	  	user: req.user,
	  	cart: cart,
	  	address: req.body.address,
	  	name: req.body.name,
	  	paymentId: charge.id
	  });
	  order.save(function(err, result) {
	  	req.flash('success', 'Successfully bought product!');
	  	req.session.cart = null;
	  	res.redirect('/');
	  });
	});
});

module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.oldUrl = req.url;
	res.redirect('/user/signin');
}
