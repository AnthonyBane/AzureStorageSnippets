const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

// each chunk of stream is a separate
// append to blob 
async function appendBlob(appendBlobClient, readableStream) {

    for await (const chunk of readableStream) {

        console.log(chunk);

        // upload a chunk as an appendBlob
        await appendBlobClient.appendBlock(chunk, chunk.length);

    }
}

async function main(blobServiceClient) {

    // create container
    const timestamp = Date.now();
    const containerName = `append-blob-from-log-${timestamp}`;
    console.log(`creating container ${containerName}`);

    const containerOptions = {
        access: 'container'
      };

    const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName, containerOptions);

    if (containerCreateResponse.errorCode) console.log("container creation failed");

    const blobName = `append-blob-${timestamp}`;
    const options = {
        metadata: {
            owner: 'YOUR-NAME',
            project: 'append-blob-sample'
        }
    };

    // get appendBlob client
    const appendBlobClient = containerClient.getAppendBlobClient(blobName);

    // create blob to save logs
    const response = await appendBlobClient.createIfNotExists(options);

    // check for errors
    if(response.errorCode){
        console.log(`Couldn't create appendBlob`);
    }

    // fetch log as stream
    // get fully qualified path of file
    // Create file `my-local-file.txt` in same directory as this file
    const localFileWithPath = path.join(__dirname, `my-local-file.txt`);

    // artificially low value to demonstrate appendBlob
    const highWaterMark = { highWaterMark: 20 }

    // fetch log as stream
    const readableStream = fs.createReadStream(localFileWithPath, highWaterMark);

    // Set encoding just to see the chunk as it goes by
    readableStream.setEncoding('utf8');

    // append stream to blob
    await appendBlob(appendBlobClient, readableStream);

}
main(blobServiceClient)
    .then(() => console.log("done"))
    .catch((ex) => console.log(ex.message));
