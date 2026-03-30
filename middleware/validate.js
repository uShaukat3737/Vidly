module.exports = function(validateFn) {
  return (req, res, next) => {
    const { error } = validateFn(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    next();
  };
};
