const { sendContactEmail } = require('../services/emailService');
const { Inquiry } = require('../models');

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

    // Save to database
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread'
    });

    // Send email to admin
    const emailResult = await sendContactEmail({
      name,
      email,
      phone,
      subject,
      message
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      inquiryId: inquiry.id,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
};

// Get all contact form submissions
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Update inquiry status
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'replied', 'ignored'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};
