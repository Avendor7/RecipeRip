<template>
    <div class="min-h-screen flex flex-col items-center justify-center">
        <h1 class="text-3xl font-bold text-center mb-8">RecipeRip</h1>

        <!-- Custom file upload -->
        <label
            class="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
            for="file-input"
        >
            <span>Choose File</span>
        </label>
        <input
            id="file-input"
            ref="fileInput"
            class="hidden"
            name="files[]"
            type="file"
            @input="handleFileInput"
        />

        <button
            v-if="file"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
            @click="submit"
        >
            Submit
        </button>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

// Reactive file reference
const file = ref<File | null>(null);

// Handle file input
const handleFileInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    file.value = target.files?.[0] || null; // Get the first selected file, or set to null if no file selected
};

// Submit method
const submit = async () => {
    if (!file.value) {
        alert("No file selected!");
        return;
    }

    // Prepare the FormData object
    const formData = new FormData();
    formData.append("file", file.value);

    try {
        // Perform the POST request to upload the file
        const response = await $fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        // Handle response (e.g., display the uploaded file or message to the user)
        console.log("File uploaded successfully:", response);
        alert("File uploaded successfully!");
    } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to upload file.");
    }
};
</script>

<style scoped></style>
