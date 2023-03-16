import {
  BlobClient,
  BlobDownloadResponseParsed,
  BlobServiceClient,
  BlockBlobUploadOptions,
  ContainerClient,
  ContainerCreateOptions,
  Tags
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

async function createBlobFromString(
  client: ContainerClient,
  blobName,
  fileContentsAsString,
  options: BlockBlobUploadOptions
) {
  const blockBlobClient = await client.getBlockBlobClient(blobName);

  await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    options
  );
  console.log(`created blob ${blobName}`);
}

async function downloadBlobToString(
  containerClient: ContainerClient,
  blobName
) {
  const blobClient: BlobClient = await containerClient.getBlobClient(blobName);

  const downloadResponse: BlobDownloadResponseParsed =
    await blobClient.download();

  const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
  if (downloaded) {
    console.log('Downloaded blob content:', downloaded.toString());
  }
}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    readableStream.on('data', (data) => {
      const content: Buffer = data instanceof Buffer ? data : Buffer.from(data);
      chunks.push(content);
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

async function main(blobServiceClient: BlobServiceClient) {
  // create container
  const timestamp = Date.now();
  const containerName = `download-blob-to-string-${timestamp}`;
  console.log(`creating container ${containerName}`);
  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(
    containerName,
    containerOptions
  );

  console.log('container creation success');

  // create blob
  const blobTags: Tags = {
    createdBy: 'YOUR-NAME',
    createdWith: `StorageSnippetsForDocs-${timestamp}`,
    createdOn: new Date().toDateString()
  };

  const blobName = `${containerName}-from-string.txt`;
  const blobContent = `Hello from a string`;

  // create blob from string
  await createBlobFromString(containerClient, blobName, blobContent, {
    tags: blobTags
  });

  // download blob to string
  await downloadBlobToString(containerClient, blobName);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
