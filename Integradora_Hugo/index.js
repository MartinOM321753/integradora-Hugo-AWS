const express = require('express');
const fileUpload = require('express-fileupload');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const Swal = require('sweetalert2');

const app = express();
app.use(fileUpload());
app.use(cors());


const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBHOSTNAME}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

const connect = async () => {
    await client.connect();
    return client.db(process.env.DBNAME);
}

app.get('/download/:id', async (req, res) => {
    const id = req.params.id;

    const database = await connect();
    const bucket = new GridFSBucket(database, { bucketName: 'bucket' });

    const file = {
        name: "",
        contentType: ""
    }

    const cursor = bucket.find({ _id: new ObjectId(id) });
    await cursor.forEach(doc => {
        file.name = doc.filename;
        file.contentType = doc.metadata.value;
    });

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));
    
    downloadStream.on('error', (err) => {
        return res.status(404).send('File not found');
    });

    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', file.contentType); 
    downloadStream.pipe(res);

    downloadStream.on('end', () => {
        client.close();
    });
});

app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const database = await connect();
    const file = req.files.archivo;
    const bucket = new GridFSBucket(database, { bucketName: 'bucket' });

    const uploadStream = bucket.openUploadStream(file.name, { chunkSizeBytes: 1048576, metadata: { field: 'contentType', value: file.mimetype } });
    const buffer = file.data;

    uploadStream.write(buffer);
    uploadStream.end();

    uploadStream.on('finish', () => {
        res.status(200).json({ message: `File uploaded with id ${uploadStream.id}` }); 
    });
});




app.get('/list', async (req, res) => {
    const database = await connect();
    const bucket = new GridFSBucket(database, { bucketName: 'bucket' });

    const files = [];
    const cursor = bucket.find({});
    await cursor.forEach(doc => {
        files.push({
            _id: doc._id,
            name: doc.filename,
            contentType: doc.metadata.value
        });
    });
    console.log(files);

    res.json(files);

    client.close();
});

app.delete('/delete/:id', async(req, res) =>{
    const id = req.params.id; 

    const database = await connect();
    const bucket = new GridFSBucket(database, { bucketName: 'bucket' });

    bucket.delete(new ObjectId(id), (error) => {
        if (error) {
            res.status(404).send('Error on deleting');
        } else {
            res.send(`File with ID ${id} deleted successfully`);
        }
        client.close(); 
    });
});

app.get('/preview/:id', async (req, res) => {
  const id = req.params.id;

  const database = await connect();
  const bucket = new GridFSBucket(database, { bucketName: 'bucket' });

  const file = {
      name: "",
      contentType: ""
  }

  const cursor = bucket.find({ _id: new ObjectId(id) });
  await cursor.forEach(doc => {
      file.name = doc.filename;
      file.contentType = doc.metadata.value;
  });

  const previewStream = bucket.openDownloadStream(new ObjectId(id));
  
  previewStream.on('error', (err) => {
      return res.status(404).send('File not found');
  });

  res.setHeader('Content-Type', file.contentType); 
  previewStream.pipe(res);

  previewStream.on('end', () => {
      client.close();
  });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

