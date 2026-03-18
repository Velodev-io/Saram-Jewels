const { Address } = require('../models');
const { ensureUserExists } = require('../utils/userSync');

// Get all addresses for the authenticated user
exports.getAddresses = async (req, res) => {
  try {
    const user = req.localUser;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addresses = await Address.findAll({
      where: { user_id: user.id },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses', error: error.message });
  }
};

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    const user = req.localUser;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, phone, address, city, state, zip, house_no, locality, country = 'India', label = 'Home', is_default = false } = req.body;
    
    console.log('--- Incoming Address Data ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', user.id);

    if (!name || !phone || !address || !locality || !city || !state || !zip) {
      const missing = [];
      if (!name) missing.push('name');
      if (!phone) missing.push('phone');
      if (!address) missing.push('address');
      if (!locality) missing.push('locality');
      if (!city) missing.push('city');
      if (!state) missing.push('state');
      if (!zip) missing.push('zip');
      
      console.warn('❌ Missing fields:', missing.join(', '));
      return res.status(400).json({ success: false, message: 'All required fields must be provided', missingFields: missing });
    }

    // If this is set as default, unset existing default
    if (is_default) {
      await Address.update({ is_default: false }, { where: { user_id: user.id } });
    }

    // If this is the first address, make it default
    const count = await Address.count({ where: { user_id: user.id } });
    const makeDefault = is_default || count === 0;

    const newAddress = await Address.create({
      user_id: user.id,
      name, phone, address, city, state, zip, house_no, locality, country, label,
      is_default: makeDefault
    });

    res.status(201).json({ success: true, data: newAddress, message: 'Address saved successfully' });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Failed to save address', error: error.message });
  }
};

// Update an existing address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.localUser;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addr = await Address.findOne({ where: { id, user_id: user.id } });
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

    const { name, phone, address, city, state, zip, house_no, locality, country, label, is_default } = req.body;

    if (is_default) {
      await Address.update({ is_default: false }, { where: { user_id: user.id } });
    }

    await addr.update({ name, phone, address, city, state, zip, house_no, locality, country, label, is_default });

    res.json({ success: true, data: addr, message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Failed to update address', error: error.message });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.localUser;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addr = await Address.findOne({ where: { id, user_id: user.id } });
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

    const wasDefault = addr.is_default;
    await addr.destroy();

    // If deleted address was default, set next recent one as default
    if (wasDefault) {
      const next = await Address.findOne({
        where: { user_id: user.id },
        order: [['created_at', 'DESC']]
      });
      if (next) await next.update({ is_default: true });
    }

    res.json({ success: true, message: 'Address removed successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.localUser;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addr = await Address.findOne({ where: { id, user_id: user.id } });
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

    await Address.update({ is_default: false }, { where: { user_id: user.id } });
    await addr.update({ is_default: true });

    res.json({ success: true, message: 'Default address updated' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Failed to set default address' });
  }
};
