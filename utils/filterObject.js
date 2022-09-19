const filterObject = (obj, ...rest) => {
  const newObj = {};

  rest.forEach((el) => {
    if (el in obj) newObj[el] = obj[el];
  });

  return newObj;
};

module.exports = filterObject;
