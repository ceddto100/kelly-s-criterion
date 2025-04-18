const admin = require('../config/firebaseAdmin');

/**
 * Middleware to verify Firebase authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Missing or invalid authorization header'
    });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Set the verified user data on the request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name || null,
      photoURL: decodedToken.picture || null,
      // Store the full decoded token for additional claims if needed
      firebaseUser: decodedToken
    };
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token',
      error: error.message
    });
  }
};

module.exports = {
  verifyFirebaseToken
}; 