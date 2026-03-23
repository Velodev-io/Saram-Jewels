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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.1em;">
            Order Confirmation
          </h2>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0; text-align: center;">
            <h1 style="color: #0f172a; font-family: 'Georgia', serif; margin-top: 0; font-size: 24px;">Thank you for your brilliance.</h1>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Your order has been elegantly received into our vault.</p>
            
            <div style="margin: 25px 0; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px dashed #cbd5e1; text-align: left;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order_id.slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Total Valuation:</strong> ₹${parseFloat(total_amount).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> <span style="font-weight: bold; color: #b45309;">COD</span></p>
            </div>

            <h3 style="text-align: left; color: #0f172a; margin-top: 30px; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Order Manifest</h3>
            <table style="width: 100%; text-align: left; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                  <th style="padding: 10px 0;">Piece</th>
                  <th style="padding: 10px 0;">Details</th>
                  <th style="padding: 10px 0; text-align: right;">Valuation</th>
                </tr>
              </thead>
              <tbody style="font-size: 13px;">
                ${(items || []).map(item => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 15px 0; font-weight: bold;">
                      ${item.product?.name || 'Jewelry Piece'}
                    </td>
                    <td style="padding: 15px 0; color: #64748b;">
                      Qty: ${item.quantity} ${item.selected_color ? `| Color: ${item.selected_color}` : ''} ${item.selected_size ? `| Size: ${item.selected_size}` : ''}
                    </td>
                    <td style="padding: 15px 0; text-align: right; font-weight: bold;">
                      ₹${parseFloat(item.price).toLocaleString()}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0; font-size: 14px;">Delivery Conservatory</h3>
            <p style="font-size: 13px; line-height: 1.6; margin-bottom: 0;">
              <strong>Recipient:</strong> ${orderData.shipping_address?.first_name} ${orderData.shipping_address?.last_name || ''}<br>
              <strong>Vault Location:</strong> ${orderData.shipping_address?.address}, ${orderData.shipping_address?.city}, ${orderData.shipping_address?.state} - ${orderData.shipping_address?.pincode}<br>
              <strong>Contact:</strong> ${orderData.shipping_address?.phone}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>Our artisans are now preparing your pieces. You will receive a dispatch notification shortly.</p>
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fecaca; border-radius: 12px; overflow: hidden; color: #1e293b;">
          <div style="background-color: #ef4444; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.2em; font-size: 16px;">New Registry Dispatch</h2>
          </div>
          
          <div style="padding: 25px;">
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #991b1b; margin-top: 0; font-size: 14px; text-transform: uppercase;">Manifest Overview</h3>
              <p style="font-size: 14px;"><strong>Registry ID:</strong> #${order_id.slice(-8).toUpperCase()}</p>
              <p style="font-size: 14px;"><strong>Curator:</strong> ${customer_name}</p>
              <p style="font-size: 14px;"><strong>Communication:</strong> ${customer_email}</p>
              <p style="font-size: 14px;"><strong>Valuation:</strong> ₹${parseFloat(total_amount).toLocaleString()}</p>
              <p style="font-size: 14px;"><strong>Collection:</strong> <span style="color: #b91c1c; font-weight: bold;">COD (To be secured)</span></p>
            </div>

            <h3 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px;">Itemized Pieces</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 25px;">
              <thead style="background-color: #f8fafc; color: #64748b;">
                <tr>
                  <th style="padding: 10px; text-align: left;">Item No (SKU)</th>
                  <th style="padding: 10px; text-align: left;">Piece Name</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Valuation</th>
                </tr>
              </thead>
              <tbody>
                ${(orderData.items || []).map(item => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 10px; font-family: monospace; font-weight: bold; color: #0369a1;">
                      ${item.product?.sku || 'N/A'}
                    </td>
                    <td style="padding: 12px 10px;">
                      ${item.product?.name || 'Piece'}<br>
                      <small style="color: #64748b;">
                        ${item.selected_color ? `Color: ${item.selected_color}` : ''} 
                        ${item.selected_size ? `| Size: ${item.selected_size}` : ''}
                      </small>
                    </td>
                    <td style="padding: 12px 10px; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: bold;">₹${parseFloat(item.price).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #cbd5e1;">
              <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #475569;">Delivery Destination</h3>
              <p style="font-size: 13px; line-height: 1.6; margin-bottom: 0;">
                <strong>Recipient:</strong> ${orderData.shipping_address?.first_name} ${orderData.shipping_address?.last_name || ''}<br>
                <strong>Address:</strong> ${orderData.shipping_address?.address}<br>
                <strong>Coordinates:</strong> ${orderData.shipping_address?.city}, ${orderData.shipping_address?.state} - ${orderData.shipping_address?.pincode}<br>
                <strong>Hotline:</strong> ${orderData.shipping_address?.phone}
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.ADMIN_URL || '#'}" style="background-color: #1e293b; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Access Admin Vault</a>
            </div>
          </div>
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
