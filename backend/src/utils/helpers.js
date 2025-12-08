// Response formatter utility
const formatResponse = (success, data = null, error = null) => {
  return {
    success,
    ...(data && { data }),
    ...(error && { error })
  };
};

// Error handler utility
const handleError = (error, res) => {
  console.error('Error:', error);
  res.status(error.status || 500).json(
    formatResponse(false, null, error.message || 'Internal Server Error')
  );
};

module.exports = {
  formatResponse,
  handleError
};
