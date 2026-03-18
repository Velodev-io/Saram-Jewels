const { verifyToken } = require('@clerk/backend');

const clerkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    console.log('✅ Token verified. sub:', payload.sub);
    console.log('🔍 Full Payload preview:', JSON.stringify({ ...payload, exp: '...' }, null, 2));
    req.user = payload;
    next();
  } catch (error) {
    console.error('❌ Clerk authentication error:', error.message);
    if (error.stack) console.debug(error.stack);
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
};

module.exports = clerkAuth;
