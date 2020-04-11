import xml2js from 'xml2js';

const convertToXML = (data) => {
  const builder = new xml2js.Builder();

  return builder.buildObject(data);
};

const buildResponse = (response, statusCode, data = null) => {
  response.format({
    'application/json': () => {
      response.status(statusCode).json(data);
    },
    'application/xml': () => {
      response.status(statusCode).send(convertToXML(data));
    },
    'text/plain': () => {
      response.status(statusCode).send();
    },
    default: () => {
      response.status(406).send('Not Acceptable');
    }
  });
};

const utils = {
  buildResponse,
  convertToXML
};

export default utils;
