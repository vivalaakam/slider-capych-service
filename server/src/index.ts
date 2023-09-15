import express from 'express';
import crypto from 'crypto';
import {createClient} from 'redis';
import {getImages} from "./get-images";
import cors from 'cors';

const app = express();
const client = createClient();

client.on('error', (err) => {
    console.error('Redis error:', err);
});


app.use(express.json())
app.use(cors());
app.get('/captcha', async (req, res) => {
    // Generate a random position for the slider between 0 to 255 for x position
    const positionX = Math.floor(Math.random() * 255) + 1;
    // Generate a random position for the slider between 0 to 130 for y position
    const positionY = Math.floor(Math.random() * 130) + 1;
    const captchaId = crypto.randomUUID();

    // Store the position in Redis with an expiry time of 5 minutes
    await client.set(captchaId, positionX, {'EX': 300});

    const {back, puzzle} = await getImages(positionX, positionY);

    res.json({
        captchaId,
        back,
        puzzle,
        prompt: 'Drag the slider to the correct position.'
    });
});

app.post('/captcha', async (req, res) => {
    const {captchaId} = req.body;

    try {
        const actualPosition = await client.get(captchaId);

        if (!actualPosition) {
            return res.status(400).json({message: 'Invalid or expired CAPTCHA'})
        }

        await client.del(captchaId);

        const values = Buffer.from(req.body.value, 'base64');

        console.log('values', values[values.length - 1], parseInt(actualPosition, 10));

        if (Math.abs(values[values.length - 1] - parseInt(actualPosition, 10)) <= 10) {
            return res.json({success: true});
        } else {
            return res.json({success: false});
        }

    } catch (e) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
});

const PORT = 3000;

client.connect().then(() => {
    console.log(`Redis connected`);
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
