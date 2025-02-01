<template>
    <div class="min-h-screen flex flex-col items-center justify-center">
        <h1 class="text-3xl font-bold text-center mb-8">RecipeRip</h1>
        <div class="flex flex-row space-x-4">
            <label
                class="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                for="file-input"
            >
                <span v-if="!file">Choose File</span>
                <span v-else>{{ file.name }}</span>
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
                class="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
                @click="submit"
            >
                Submit
            </button>
        </div>
        <div class="flex flex-row space-x-4 mt-4 mr-4">
            <div>
                <video
                    v-if="videoSrc"
                    :src="videoSrc"
                    controls
                    class="mt-4 max-w-screen-md rounded border-solid border-2 border-gray-300"
                ></video>
            </div>
            <div
                v-if="recipe"
                v-html="sanitizedMarkdown"
                class="prose max-w-screen-md mt-4 p-4 bg-gray-100 rounded"
            ></div>
            <div v-else-if="loading">Loading</div>
        </div>
        <div class="mt-8">
            <h2>Server Messages:</h2>
            <ul>
                <li v-for="(msg, index) in messages" :key="index">
                    {{ msg }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Reactive file reference
const file = ref<File | null>(null);
const videoSrc = ref<string | null>(null);
const loading = ref<boolean>(false);
// Handle file input
const handleFileInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    file.value = target.files?.[0] || null; // Get the first selected file, or set to null if no file selected
    videoSrc.value = URL.createObjectURL(file.value!);
};
const recipe = ref<string>("");

const messages = ref<string[]>([]);
let eventSource: EventSource | null = null;

const submit = async () => {
    if (!file.value) {
        alert("No file selected!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file.value);

    try {
        loading.value = true;
        const response = await axios.post(
            "http://localhost:3000/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        console.log(response.data.data);
        recipe.value = response.data.data;
        loading.value = false;
    } catch (error) {
        console.error(error);
    }
};

// Compute sanitized Markdown for safe rendering
const sanitizedMarkdown = computed(() => {
    if (recipe.value) {
        const parsedMarkdown = marked.parse(recipe.value) as string;
        return DOMPurify.sanitize(parsedMarkdown);
    }
    return "";
});

onMounted(() => {
    //create an event source for SSE.
    eventSource = new EventSource("http://localhost:3000/events");

    eventSource.onmessage = (event: MessageEvent) => {
        try {
            const parsedData = JSON.parse(event.data);
            messages.value.push(
                `Job ${parsedData.jobId} completed: ${JSON.stringify(parsedData)}`,
            );
        } catch (error) {
            console.error("Failed to parse SSE data.", error);
        }
    };

    eventSource.onerror = (error) => {
        console.error("SSE error:", error);
    };
});

onBeforeUnmount(() => {
    // Close the connection when the component is unmounted
    if (eventSource) {
        eventSource.close();
    }
});
</script>

<style scoped></style>
