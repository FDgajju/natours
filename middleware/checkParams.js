const checkParams = (req, res, next) => {
  const { body, user, params } = req;
  if (!body.tour) body.tour = params.tourId;
  if (!body.user) body.user = user.id;

  next();
};

module.exports = checkParams;
