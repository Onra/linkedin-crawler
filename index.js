'use strict';

var express = require('express');
var https = require('https');
var cheerio = require('cheerio');

var app = express();

var options = {
    host: 'www.linkedin.com',
    port: 443,
    method: 'GET'
}

app.get('/profile/:username', function(req, result) {

    options.path = '/in/' + req.params.username;

    console.log(options);

    https.get(options, function(res) {
        console.log('Status code: %s', res.statusCode);

        res.setEncoding('utf8');

        var html;

        res.on('data', function(data) {

            html += data;

        });

        res.on('end', function() {
            var $ = cheerio.load(html);

            var languages = [];

            $('#languages .section-item').each(function(index, languageElement) {

                var language = {
                    name: $(languageElement).find('span').html(),
                    proficiency: $(languageElement).find('.languages-proficiency').html()
                };
                languages.push(language);
            });

            var positions = [];

            $('#background-experience .section-item').each(function(index, positionElement) {

                var dateInterval = $(positionElement).find('.experience-date-locale').html();

                var endDate = $(positionElement).find('.experience-date-locale > time:nth-child(2)').html();
                var startDate = $(positionElement).find('.experience-date-locale > time').remove().html();

                if (!endDate) {
                    $(positionElement).find('.experience-date-locale > time').remove();
                    $(positionElement).find('.experience-date-locale > span').remove();
                    var subDate = $(positionElement).find('.experience-date-locale').html();
                    subDate = subDate.substring(subDate.indexOf("&#x2013;") + 9, subDate.length);
                    subDate = subDate.substring(0, subDate.indexOf(' '));
                    endDate = subDate;
                }

                var company = $(positionElement).find('header > h5:nth-child(3) > a').html() ?
                                $(positionElement).find('header > h5:nth-child(3) > a').html() :
                                $(positionElement).find('header > h5 > span').html();

                var position = {
                    title: $(positionElement).find('h4 > a').html(),
                    startDate: startDate,
                    endDate: endDate,
                    company: company,
                    summary: $(positionElement).find('p').html()
                };
                positions.push(position);
            });

            var jsonResult = {
                userData: {
                    name: $('span.full-name').html(),
                    headline: $('.title').html(),
                    languages: languages,
                    positions: positions
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
