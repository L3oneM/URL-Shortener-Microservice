const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const ModelClass = require('./models/shortUrl');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// COnnect To The DAtabase
const db = require('./config/key').mongoURL

mongoose
	.connect(db, { useNewUrlParser: true })
	.then(() => console.log('MongoDB Connected...'))
	.catch(err => console.log(err));

app.use(express.static(__dirname + '/public'));

app.get('/new/:urlShorten(*)', (req, res, next) => {
	const { urlShorten } = req.params;
	// Test for invalid Url
	const regex = /[-a-zA-Z0-9@:%\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%\+.~#?&//=]*)?/gi;
	
	if (regex.test(urlShorten)) {
		const shortedUrl = Math.floor(Math.random()*100000).toString();
		const data = new ModelClass({
			originalUrl: urlShorten,
			shorterUrl: shortedUrl
		});

		data.save()
			.catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });;

		return res.json(data);
	}

	return res.json({ "error":"invalid URL" });
});

app.get('/:urlToForward', (req, res, next) => {
	var   shorterUrl   = req.params.urlToForward;
	console.log(req.params.urlToForward, shorterUrl)
	ModelClass.findOne({ 'shorterUrl': shorterUrl}, (err, data) => {
		if(err) return res.send({'error': 'Error reading data'});
		console.log('!!')
		const regex = /^(http|https):/i; //", "i");
		const strToCheck = data.originalUrl;
		if (regex.test(strToCheck)) {
			res.redirect(301, data.originalUrl);
		} else {
			res.redirect(301, 'http://' + data.originalUrl);
		}
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
})


