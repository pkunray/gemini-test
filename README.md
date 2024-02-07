# gemini-test

## Project description
In this project, we test gemini AI with multimodal prompts. The supported model is `gemini-pro-vision`.


### Configure Google Cloud

1. Complete the following configuration according to [Google Cloud Doc](https://cloud.google.com/vertex-ai/docs/start/cloud-environment).
* Select a proper Google Cloud project
* Enable the Vertex AI API
* Install the Google Cloud CLI
* Update and install gcloud components

2. Create a service account and generate a service account key according to this document: https://cloud.google.com/vertex-ai/docs/start/client-libraries#before_you_begin

3. Install Google CLoud Client Library

```
npm install @google-cloud/aiplatform
```

4. Configure your own google cloud service account credential in backend

```
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'Your Own Service Account Credential Path';
```

### Start the frontend

```
npm run serve
```


### Start the backend

```
node index.js
```

## References
1. [Send multimodal prompt requests with images](https://cloud.google.com/vertex-ai/docs/generative-ai/multimodal/send-multimodal-prompts#send_multimodal_prompt_requests_with_images)