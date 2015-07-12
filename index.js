'use strict';

var express = require('express');
var https = require('https');
var cheerio = require('cheerio');

var app = express();

var options = {
    host: 'www.linkedin.com',
    port: 443,
    path: '',
    method: 'GET'
}

app.get('/profile/:username', function(req, result) {

    options.path = '/in/' + req.params.username;

    console.log(options);

    https.get(options, function(res) {
        console.log('Status code: %s', res.statusCode);

        var html;

        res.on('data', function(data) {

            html += data.toString();

        });

        res.on('end', function() {
            var $ = cheerio.load(html);

            var languages = [];

            $('#languages .section-item').each(function(index, languageElement) {

                console.log($(languageElement).find('span').html());

                var language = {
                    name: $(languageElement).find('span').html(),
                    proficiency: $(languageElement).find('.languages-proficiency').html()
                };
                languages.push(language);
            });

            var jsonResult = {
                userData: {
                    name: $('span.full-name').html(),
                    headline: $('.title').html(),
                    languages: languages
                }
            };

            result.json(jsonResult);
        });

    }).on('error', function(err) {
        console.log(('Got error: %s', err.message));
    });
});



var server = app.listen(3000, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
