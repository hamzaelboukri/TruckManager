export const formatResponse = (success, data = null, error = null) => {
  return {
    success,
    ...(data && { data }),
    ...(error && { error })
  };
};

export const handleError = (error, res) => {
  console.error('Error:', error);
  res.status(error.status || 500).json(
    formatResponse(false, null, error.message || 'Internal Server Error')
  );
};
