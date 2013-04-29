var http = require('http'),
	fs = require('fs'),
	dateFormat = require('dateformat'),
	nodemailer = require('nodemailer'),
	transport = nodemailer.createTransport('SMTP'),
	key = '18b79e98455a935a',
	feature = 'history_',
	query = 'q/38.905222,-76.984467.json',
	rainReport = [],
	i = 0;

var report = function (rain) {
	var subject, body;

	if (rain.length) {
		subject = 'It rained this week';
		body = 'It rained on ';
		rain.forEach(function (day, index) {
			body += dateFormat(day, 'dddd, mmmm d');

			// TODO: Update to use a nice serialize function
			// http://jsfiddle.net/nate/NFCSJ/
			if (rain.length >= 3) {
				if (index < (rain.length - 2)) {
					body += ', ';
				} else if (index === (rain.length - 2)) {
					body += ', and ';
				} else {
					body += '.';
				}
			} else if (rain.length === 2) {
				if (index < 1) {
					body += ' and ';
				} else {
					body += '.';
				}
			} else {
				body += '.';
			}
		});
	} else {
		subject = 'It did not rain this week';
		body = 'No rain this week; somebody should water the tree!';
	}

	console.log('\nSending email:');
	console.log('Subject:', subject);
	console.log('Text:', body);

	transport.sendMail({
		from: 'nate@nateeagle.com',
		to: 'rebekaheagle@gmail.com, n.eagle@gmail.com',
		subject: subject,
		text: body
	}, function (error, response) {
		if (error) {
			console.log(error);
		} else {
			console.log('Message sent.');
			process.exit(0);
		}
	});
};

var checkForRain = function (date) {
	console.log('Checking', dateFormat(date, 'dddd, mmmm d') + '...');

	var path = [
		'/api/',
		key, '/',
		feature, dateFormat(date, 'yyyymmdd'), '/',
		query
	].join('');

	var options = {
		host: 'api.wunderground.com',
		port: 80,
		path: path
	};

	http.get(options, function (response) {
		var data = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			if (chunk) {
				data += chunk;
			}
		});
		response.on('end', function () {
			data = JSON.parse(data);
			var rain = data.history.dailysummary[0].rain;
			//console.log(rain);
			if (rain === '1') {
				rainReport.unshift(date);
			}
			i += 1;
			if (i >= 7) {
				report(rainReport);
			} else {
				var newDate = new Date();
				newDate.setDate(newDate.getDate() - i);
				checkForRain(newDate);
			}
		});
	}).on('error', function (error) {
		console.log('Got error: ' + error.message);
	});
};

checkForRain(new Date());
