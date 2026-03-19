const nodemailer = require('nodemailer');

// Create transporter for Gmail
let transporter = null;

// Only create transporter if email credentials are configured
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  console.log('Email credentials not configured. Contact form submissions will be logged only.');
}

// Send contact form email
const sendContactEmail = async (contactData) => {
  try {
    const { name, email, phone, subject, message } = contactData;
    
    // Log the contact form submission
    console.log('📧 Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone || 'Not provided');
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('---');
    
    // If email transporter is not configured, just log and return success
    if (!transporter) {
      console.log('⚠️ Email not sent - credentials not configured. Please set up EMAIL_USER and EMAIL_PASSWORD in .env file');
      return { success: true, messageId: 'logged-only' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'saramjewels@gmail.com',
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Message</h3>
            <p style="color: #78350f; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>This message was sent from the Saram Jewels contact form.</p>
            <p>Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error.code === 'EAUTH') {
      console.log('💡 TIP: For Gmail, you must use an "App Password" if 2FA is enabled. Regular passwords will be blocked.');
    }
    return { success: false, error: error.message };
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (orderData, userEmail) => {
  try {
    const { order_id, total_amount, items } = orderData;
    
    // Log the order confirmation
    console.log('📧 Order Confirmation Email:');
    console.log('Order ID:', order_id);
    console.log('Total Amount:', total_amount);
    console.log('User Email:', userEmail);
    console.log('Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('---');
    
    // If email transporter is not configured, just log and return success
    if (!transporter) {
      console.log('⚠️ Order confirmation email not sent - credentials not configured');
      return { success: true, messageId: 'logged-only' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Confirmation - Order #${order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Order Confirmation
          </h2>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0; text-align: center;">
            <h1 style="color: #0f172a; font-family: 'Georgia', serif; margin-top: 0; font-size: 24px;">Thank you for your brilliance.</h1>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Your order has been elegantly received. We are preparing your selection for its journey to you.</p>
            
            <div style="margin: 25px 0; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px dashed #cbd5e1; text-align: left;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order_id}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${total_amount.toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> <span style="color: #475569; font-weight: bold;">Cash on Delivery (COD)</span></p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #0f172a; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Awaiting Delivery</span></p>
            </div>
            
            <p style="color: #1e293b; font-size: 13px; font-weight: 500;">
              Please keep the exact amount of ₹${total_amount.toLocaleString()} ready for our delivery partner.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>We'll process your order and ship it to you soon.</p>
            <p>If you have any questions, please contact us at saramjewels@gmail.com</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order notification email to admin
const sendAdminOrderNotification = async (orderData) => {
  try {
    const { order_id, total_amount, customer_name, customer_email } = orderData;
    
    if (!transporter) return { success: true, messageId: 'logged-only' };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'saramjewels@gmail.com',
      subject: `New Order Received: #${order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Order Notification
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${order_id}</p>
            <p><strong>Customer:</strong> ${customer_name}</p>
            <p><strong>Email:</strong> ${customer_email}</p>
            <p><strong>Total Amount:</strong> ₹${total_amount.toLocaleString()}</p>
            <p><strong>Payment:</strong> <span style="color: #b91c1c; font-weight: bold;">COD (To be collected)</span></p>
          </div>
          
          <p>Please log in to the admin panel to process this order.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending admin order notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactEmail,
  sendOrderConfirmationEmail,
  sendAdminOrderNotification
};
