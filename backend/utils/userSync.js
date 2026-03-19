const { createClerkClient } = require('@clerk/backend');
const User = require('../models/User');
require('dotenv').config();

// Initialize clerk client lazily or inside function if needed, 
// but for now let's just ensure we have the key
const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) {
  console.warn('⚠️ CLERK_SECRET_KEY is NOT defined in backend environment!');
} else {
  console.log('✅ CLERK_SECRET_KEY is present (length:', secretKey.length, ')');
}
const clerk = createClerkClient({ secretKey });

/**
 * Ensures a user exists in the local database by checking clerkUserId
 * If not found, fetches data from Clerk API and creates a local record
 */
const ensureUserExists = async (clerkUserId) => {
  try {
    if (!User) {
      throw new Error('User model is not loaded correctly');
    }
    
    let user = await User.findOne({ where: { clerk_user_id: clerkUserId } });
    
    if (!user) {
      console.log(`User ${clerkUserId} not found in local DB. Fetching from Clerk...`);
      if (!clerk) throw new Error('Clerk client not initialized');
      
      const clerkUser = await clerk.users.getUser(clerkUserId);
      
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        throw new Error('User has no email address in Clerk');
      }

      user = await User.create({
        clerk_user_id: clerkUserId,
        email: email,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
      });
      console.log(`Local user record created for ${email}`);
    }
    
    return user;
  } catch (error) {
    console.error(`Error in ensureUserExists for ${clerkUserId}:`, error.message);
    if (error.stack) console.debug(error.stack);
    throw error;
  }
};

module.exports = { ensureUserExists };
