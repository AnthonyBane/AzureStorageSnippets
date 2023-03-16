// Azure Storage dependency
import {
  BlobServiceClient,
  StorageSharedKeyCredential
} from '@azure/storage-blob';

// For development environment - include environment variables from .env
import * as dotenv from 'dotenv';
dotenv.config();

// Azure Storage resource name
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
if (!accountName) throw Error('Azure Storage accountName not found');

// Azure Storage resource key
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
if (!accountKey) throw Error('Azure Storage accountKey not found');

// Create credential
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

const baseUrl = `https://${accountName}.blob.core.windows.net`;
const containerName = `my-container`;

// Create BlobServiceClient
const blobServiceClient = new BlobServiceClient(
  `${baseUrl}`,
  sharedKeyCredential
);

async function main() {
  try {
    // Create container client
    const containerClient = await blobServiceClient.getContainerClient(
      containerName
    );

    // do something with containerClient...
    let i = 1;

    // List blobs in container
    for await (const blob of containerClient.listBlobsFlat({
      includeMetadata: true,
      includeSnapshots: false,
      includeTags: true,
      includeVersions: false,
      prefix: ''
    })) {
      console.log(`Blob ${i++}: ${blob.name}`);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

main()
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
