import bodyParser from 'body-parser';
import express from 'express';
import fs from 'fs';
import * as Joi from 'joi';
import morgan from 'morgan';
import * as path from 'path';
import covid19ImpactEstimator from './estimator';
import utils from './util';

const validationSchema = Joi.object({
  region: Joi.object({
    name: Joi.string(),
    avgAge: Joi.number(),
    avgDailyIncomeInUSD: Joi.number(),
    avgDailyIncomePopulation: Joi.number()
  })
    .required()
    .label('Region'),
  periodType: Joi.string()
    .required()
    .only(['days', 'months', 'weeks'])
    .label('Period type'),
  timeToElapse: Joi.number().required().label('Time to elapse'),
  reportedCases: Joi.number().required().label('Reported cases'),
  population: Joi.number().required().label('Population'),
  totalHospitalBeds: Joi.number().required().label('Total hospital beds')
});

// const startServer = () => {
const app = express();
const dirname = path.resolve();
const logPath = path.join(dirname, 'logs', 'access.log');
const accessLogStream = fs.createWriteStream(logPath, { flags: 'a' });

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(
  morgan(
    (tokens, req, res) => {
      const logStr = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res)
      ].join('\t\t');

      return `${logStr} ms`;
    },
    { stream: accessLogStream }
  )
);

app.use((request, response, next) => {
  if (request.url.includes('logs')) {
    request.headers.accept = 'text/plain';
    response.setHeader('content-type', 'text/plain');
  }

  next();
});

app.get('/api/v1/on-covid-19/logs', (request, response) => {
  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) throw err;

    response.send(data);
  });
});

app.post('/api/v1/on-covid-19/:type?', (request, response) => {
  const { body } = request;

  Joi.validate(body, validationSchema, (err) => {
    if (err) {
      response
        .status(400)
        .json({
          status: 'error',
          message: 'Invalid request data',
          err
        })
        .send();
    } else {
      const result = covid19ImpactEstimator(body);

      if (request.params.type === 'xml') {
        request.headers.accept = 'application/xml';
      }

      utils.buildResponse(response, 200, result);
    }
  });
});

app.listen(process.env.PORT || 3000);
