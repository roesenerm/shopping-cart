var Product = require('../models/product');
var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

var products = [
	new Product({
		imagePath: 'http://static1.squarespace.com/static/560ed82ae4b0a400f2f47c2f/t/570bfcc37c65e4e7050d697f/1460403460651/Waveshaper+2+Final.jpg?format=500w',
		title: 'Cool',
		description: 'Awesome',
		price: 10
	}),
	new Product({
		imagePath: 'http://static1.squarespace.com/static/560ed82ae4b0a400f2f47c2f/t/570bfcc37c65e4e7050d697f/1460403460651/Waveshaper+2+Final.jpg?format=500w',
		title: 'Cool 2',
		description: 'Awesome 2',
		price: 12
	}),
];

var done = 0;
for (var i=0; i<products.length; i++) {
	products[i].save(function(err, result) {
		done++;
		if (done === products.length) {
			exit();
		}
	});
};

function exit() {
	mongoose.disconnect();
}