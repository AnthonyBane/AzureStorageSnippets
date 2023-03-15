import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connString) throw Error('Azure Storage Connection string not found');

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

  // create a container
  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(containerName, containerOptions);

  const blobName = `append-blob-for-await-${timestamp}`;
  const options = {
    metadata: {
      owner: 'YOUR-NAME',
      project: 'append-blob-sample'
    }
  };

  // get appendBlob client
  const appendBlobClient = containerClient.getAppendBlobClient(blobName);

  // create blob to save logs
  await appendBlobClient.createIfNotExists(options);
  console.log(`Created appendBlob`);

  // fetch log as stream
  // get fully qualified path of file
  // Create file `my-local-file.txt` in `./files` directory
  const localFileWithPath = path.join(__dirname, `../files/my-local-file.txt`);
  console.log(`localFileWithPath: ${localFileWithPath}`);

  // highWaterMark: artificially low value to demonstrate appendBlob
  // encoding: just to see the chunk as it goes by
  const encoding: BufferEncoding = 'utf-8';
  const streamOptions = { highWaterMark: 20, encoding };

  // fetch log as stream
  const readableStream = fs.createReadStream(localFileWithPath, streamOptions);

  // Set encoding just to see the chunk as it goes by
  readableStream.setEncoding('utf8');

  // append stream to blob
  await appendBlob(appendBlobClient, readableStream);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
