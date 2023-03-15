// Azure Storage dependency
import {
  StorageSharedKeyCredential,
  ContainerClient
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
const blobName = `my-blob`;

// Create ContainerClient
const containerClient = new ContainerClient(
  `${baseUrl}/${containerName}`,
  sharedKeyCredential
);

async function main() {
  try {
    // Create BlobClient object
    const blobClient = containerClient.getBlobClient(blobName);

    // do something with blobClient...
    const properties = await blobClient.getProperties();
    console.log(`Blob ${blobName} properties:`);

    // get BlockBlobClient from blobClient
    const blockBlobClient = blobClient.getBlockBlobClient();

    // do something with blockBlobClient...
    const downloadResponse = await blockBlobClient.download(0);
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
