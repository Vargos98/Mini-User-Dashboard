export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong' : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: {
      message: `No route for ${req.method} ${req.path}`,
      status: 404,
    },
  });
};
