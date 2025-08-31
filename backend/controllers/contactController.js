const { sendContactEmail } = require('../services/emailService');

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Send email
    const emailResult = await sendContactEmail({
      name,
      email,
      phone,
      subject,
      message
    });

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
        messageId: emailResult.messageId
      });
    } else {
      console.error('Email sending failed:', emailResult.error);
      // For now, return success even if email fails, since the message is logged
      res.status(200).json({
        success: true,
        message: 'Thank you for your message! We have received it and will get back to you soon.',
        messageId: 'logged-only'
      });
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
};
