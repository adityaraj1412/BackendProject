const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/contact', async (req, res) => {
  let { name, email, message } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'adittrjj@gmail.com', // replace with your email
      pass: 'kahnzodfpdgipswk', // replace with your password
    },
  });

  let mailOptions = {
    from: email,
    to: 'adittrjj@gmail.com', // replace with your email
    subject: `Message from ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Message sent successfully');
  } catch (error) {
    console.error('Failed to send message', error);
    res.status(500).send('Failed to send message');
  }
});

app.listen(4000, () => console.log('Server started on port 3001'));
