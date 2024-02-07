const express = require('express');
const multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'srh-acs-gemini';

const {VertexAI} = require('@google-cloud/vertexai');
const axios = require('axios');

process.env.GOOGLE_APPLICATION_CREDENTIALS = '/Users/kun/Desktop/srh-acs-gemini-f67190d1d529.json';

const app = express();
const port = 3000;

const path = require('path');
const { get } = require('http');

app.use(express.static('public'));
app.use(express.json());

app.post('/upload', upload.single('image'), (req, res) => {
    console.log("Uploading file");
    
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(req.file.originalname);
    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype,
        },
    });

    stream.on('error', (err) => {
        req.file.cloudStorageError = err;
        console.log(err);
        res.status(500).send('Failed to upload image.');
    });

    stream.on('finish', () => {
        req.file.cloudStoragePublicUrl = getPublicUrl(req.file.originalname);
        console.log(req.file.cloudStoragePublicUrl);
        res.send(req.file.cloudStoragePublicUrl);
    });

    stream.end(req.file.buffer);
});

function getPublicUrl(filename) {
    return `https://storage.googleapis.com/${'srh-acs-gemini'}/${filename}`;
}

async function getBase64(url) {
    const image = await axios.get(url, {responseType: 'arraybuffer'});
    return Buffer.from(image.data).toString('base64');
}

async function sendMultiModalPromptWithImage(
    projectId = 'srh-acs-gemini',
    location = 'us-central1',
    model = 'gemini-pro-vision',
    prompt,
    imageUrl
) {
    // Initialize Vertex with your Cloud project and location
    const vertexAI = new VertexAI({ project: projectId, location: location });
    const generativeVisionModel = vertexAI.preview.getGenerativeModel({
        model: model,
    });

    let landmarkImageOnlyOne = null;
    let imagePart = null;

    if (imageUrl) {
        landmarkImageOnlyOne = await getBase64(imageUrl);
        imagePart = {
            inlineData: {
                data: landmarkImageOnlyOne,
                mimeType: getMimeTypeFromUrl(imageUrl),
            },
        };
    }
    const textPart = {
        text: prompt,
    };
    const parts = [];
    if (imagePart) {
        parts.push(imagePart);
    }
    parts.push(textPart);
    const request = {
        contents: [
            {
                role: 'user',
                parts: parts,
            },
        ],
    };
    // Create the response
    const response = await generativeVisionModel.generateContent(request);
    // Wait for the response to complete
    const aggregatedResponse = await response.response;
    console.log(JSON.stringify(aggregatedResponse, null, 2));
    const fullTextResponse = aggregatedResponse.candidates[0].content.parts[0].text;
    return(fullTextResponse);
    // return aggregatedResponse;
}  

app.post('/prompt', async (req, res) => {
    console.log('Received prompt:', req.body);
    res.send(await sendMultiModalPromptWithImage(undefined, undefined, undefined, req.body.prompt, req.body.image));
});

function getMimeTypeFromUrl(url) {
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    const fileExtension = path.extname(fileName).toLowerCase();
    switch (fileExtension) {
    case '.jpg':
    case '.jpeg':
        return 'image/jpeg';
    case '.png':
        return 'image/png';
    default:
        throw new Error('Unsupported image type');
    }
}
  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});