<template>
  <div class="image-uploader">
    <div class="input-section">
      <input type="file" ref="fileInput" @change="handleFileChange" />
      <button @click="uploadImage">Upload Image</button>
    </div>
    <div class="image-preview">
      <img v-if="previewImage" :src="previewImage" alt="Preview" style="max-width: 300px; max-height: 300px; margin-top: 10px;" />
    </div>
    <div class="text-section">
      <textarea
        rows="10" 
        cols="50"
        v-model="textInput"
        placeholder="Enter your text Prompt here..."></textarea>
    </div>
    <button @click="sendPrompt">Send Prompt</button>
    <div class="response-section">
      <p class="response-title">Answer:</p>
      <pre v-html="formattedResponse"></pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFile: null,
      previewImage: null,
      publicUrl: null,
      textInput: "",
      serverResponse: "waiting for response...",
    };
  },
  methods: {
    handleFileChange(event) {
      this.publicUrl = null;
      this.selectedFile = event.target.files[0];
      // Display image preview
      if (this.selectedFile) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewImage = reader.result;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.previewImage = null;
      }
    },
    async uploadImage() {
      if (!this.selectedFile) {
        alert('Please select a file to upload.');
        return;
      }
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      try {
        const response = await this.$axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Upload successful:', response.data);
        this.publicUrl = response.data;
        alert('Upload successful!');
      } catch (error) {
        console.error('Upload failed:', error.message);
        alert('Upload failed. Please try again.');
      }
    },
    async sendPrompt() {
      try {
        const response = await this.$axios.post('/api/prompt', { prompt: this.textInput, image: this.publicUrl });
        this.serverResponse = response.data;
      } catch (error) {
        console.error('Error sending prompt:', error.message);
        this.serverResponse = 'Error sending prompt.';
      }
    },
  },
  computed: {
    formattedResponse() {
      if (!this.serverResponse) return ""; 

      const lines = this.serverResponse.split("\n").map(line => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return `<strong>${line.slice(2, -2)}</strong>`;
        } else if (line.startsWith("*")) {
          return `<em>${line.slice(1)}</em>`;
        } else {
          return line;
        }
      });
      return lines.join("<br>");
    },
  },
};
</script>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.input-section {
  margin-bottom: 20px;
}
.image-preview {
  margin-bottom: 20px;
}
.text-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.response-title {
  font-weight: bold;
  margin-bottom: 5px;
}
.response-section {
  margin-top: 20px;
}
</style>
