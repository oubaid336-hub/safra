const multer = require('multer');

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 5MB per photo.' });
    }
    return res.status(400).json({ message: 'File upload error' });
  }

  if (err && err.message === 'Invalid file type') {
    return res.status(400).json({ message: 'Only JPG, PNG, and WEBP images are allowed' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
}

module.exports = errorHandler;
