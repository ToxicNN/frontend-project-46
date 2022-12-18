/* eslint-disable import/extensions */
/* eslint-disable no-console */
import _ from 'lodash';
import parseFile from './parsers.js';
import stylish from './formaters/stylish.js';

export default (filepath1, filepath2, format) => {
  const data1 = parseFile(filepath1);
  const data2 = parseFile(filepath2);

  const iter = (value1, value2) => {
    const diff = _.union(Object.keys(value1), Object.keys(value2)).sort()
      .map((currentKey) => {
        let result;
        if (_.has(value1, currentKey) && _.has(value2, currentKey)) {
          if (!_.isObject(value1[currentKey]) && !_.isObject(value2[currentKey])) {
            result = (value1[currentKey] === value2[currentKey])
              ? { key: currentKey, value: value1[currentKey], type: 'unchanged' }
              : {
                key: currentKey, value1: value1[currentKey], value2: value2[currentKey], type: 'changed',
              };
          } else if (_.isObject(value1[currentKey]) && _.isObject(value2[currentKey])) {
            result = { key: currentKey, children: iter(value1[currentKey], value2[currentKey]), type: 'nested' };
          } else if (_.isObject(value1[currentKey]) && !_.isObject(value2[currentKey])) {
            result = {
              key: currentKey, value1: value1[currentKey], value2: value2[currentKey], type: 'changed',
            };
          }
        } else {
          result = (_.has(value1, currentKey) && !_.has(value2, currentKey))
            ? { key: currentKey, value: value1[currentKey], type: 'deleted' }
            : { key: currentKey, value: value2[currentKey], type: 'added' };
        }
        return result;
      });
    return diff;
  };
  switch (format) {
    case 'stylish':
      return stylish(iter(data1, data2));
    default:
      throw new Error(`Формат ${format} не поддерживается!\nВведите один из следующих форматов: stylish`);
  }
};
