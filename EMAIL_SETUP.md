# 📧 Email Setup Guide for Saram Jewels

## Gmail Configuration

To enable email functionality for the contact form, you need to configure Gmail SMTP settings.

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication for your Gmail account

### 2. Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Copy the 16-character password

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following:

```env
# Email Configuration
EMAIL_USER=saramjewels@gmail.com
EMAIL_PASSWORD=your_16_character_app_password

# Other configurations...
DATABASE_URL=postgresql://username:password@localhost:5432/saram_dev
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
PORT=5000
NODE_ENV=development
```

### 4. Test Email Functionality
1. Start the backend server: `npm run dev`
2. Go to the contact form on the website
3. Fill out and submit the form
4. Check saramjewels@gmail.com for the received email

## Email Features

### Contact Form Emails
- All contact form submissions are sent to saramjewels@gmail.com
- Emails include sender's name, email, phone, subject, and message
- Professional HTML formatting with Saram Jewels branding

### Order Confirmation Emails
- Customers receive order confirmation emails
- Includes order details and contact information

## Troubleshooting

### Common Issues:
1. **Authentication failed**: Make sure you're using an app password, not your regular Gmail password
2. **Connection timeout**: Check your internet connection and firewall settings
3. **Email not received**: Check spam folder and verify the email address is correct

### Security Notes:
- Never commit your `.env` file to version control
- Use app passwords instead of regular passwords
- Keep your app password secure and don't share it
