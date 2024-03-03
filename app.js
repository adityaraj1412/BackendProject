const express=require('express')
const app=express();
const path=require('path')
const mongoose=require('mongoose')
const multer=require('multer');
const methodOverride=require('method-override')
const fs=require('fs')
const cors = require('cors'); // Import the CORS package
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

app.use(cors({ origin: '*' }));

app.use(cors());
app.use(bodyParser.json());

app.post('/api/contact', async (req, res) => {
    let { name, email, message } = req.body;
  
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shreeramvivahbhawan@gmail.com', // replace with your email
        pass: 'frdzrprpgnwg ngqj', // replace with your password
      },
    });
  
    let mailOptions = {
      from: email,
      to: 'shreeramvivahbhawan@gmail.com', // replace with your email
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

  mongoose.connect('mongodb+srv://adityapersonalac:Gekz4BsFywAm9Q49@cluster0.69lbgdp.mongodb.net/imagesDB')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });
let imageScheme = new mongoose.Schema({
    imgUrl : String
});
let Picture = mongoose.model('Picture',imageScheme);

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.get('/', async (req, res) => {
    try {
        const images = await Picture.find({}).exec();
        // Map image paths to complete URLs
        const updatedImages = images.map(img => ({
            _id: img._id,
            imgUrl: `https://wedd-7034.onrender.com${img.imgUrl.replace(/\\/g, '/')}`, // Construct complete URL
            __v: img.__v
        }));
        res.json({ images: updatedImages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});
app.get('/upload', (req,res)=> {
    res.render('upload');
});
let storage=multer.diskStorage({
    destination:'./public/uploads/images',
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})
let upload=multer ({
    storage: storage,
    fileFilter:(req,file,cb)=>{
        checkFileType(file,cb)
    }
});

function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if(extname) {
        return cb(null, true);
    } else {
        cb('Error: Please images only.');
    }
}
app.post('/uploadsingle', upload.single('singleImage'), async (req, res) => {

    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'Please select an Image.' });
    }

    try {
        const newPicture = await Picture.create({ imgUrl: file.path.replace('public', '') });
        res.json({ picture: newPicture });
    } catch (error) {
        console.error('Error creating picture:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.delete('/delete/:id', async (req, res) => {
    try {
        const searchQuery = { _id: req.params.id };
        const picture = await Picture.findOne(searchQuery);

        if (picture) {
            const imagePath = path.join(__dirname, 'public', picture.imgUrl);

            // Check if the file exists before attempting to delete
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(err);
                        throw err; // Throw the error to be caught by the catch block
                    }
                });
            } else {
                console.error(`File not found: ${imagePath}`);
            }

            await Picture.deleteOne(searchQuery);
            res.redirect('/');
        } else {
            res.status(404).json({ error: 'Picture not found' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const bookingSchema = new mongoose.Schema({
    venue: {
        type: String,
        default: 'Ram Vivah Bhawan', // Set the default value to 'Ram Vivah Bhawan'
    },
    startDate: Date,
    endDate: Date,
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // Check if the phone number is a 10-digit number
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    },
    purpose: String,
});

const Booking = mongoose.model('Booking', bookingSchema);

app.post('/api/bookings', async (req, res) => {
    try {
        // If the user didn't provide a venue, it will default to 'Ram Vivah Bhawan'
        req.body.venue = req.body.venue || 'Ram Vivah ';
        req.body.purpose = req.body.purpose || 'Marriage Ceremony ';
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



app.listen(4000,()=>{
    console.log('server started')
})