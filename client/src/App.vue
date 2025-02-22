<template>
    <div class="min-h-screen bg-gray-900 flex flex-col">
        <header class="bg-gray-800 text-white py-5 shadow-md">
            <h1 class="text-3xl md:text-4xl font-bold text-center">
                RecipeRip
            </h1>
        </header>
        <main class="flex flex-col items-center justify-center flex-grow py-8">
            <!-- Upload Card -->
            <div
                class="bg-gray-800 w-full max-w-md rounded-lg shadow-md p-6 mb-8 border border-gray-700"
            >
                <h2 class="text-2xl font-semibold mb-4 text-gray-100">
                    Upload Your Video
                </h2>

                <!-- File Selection + Submit -->
                <div
                    class="flex flex-col space-y-3 md:space-y-0 md:flex-row md:space-x-4 items-center"
                >
                    <!-- File Input Label/Button -->
                    <input
                        id="fileInput"
                        type="file"
                        class="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-700"
                        @change="handleFileInput"
                    />

                    <!-- Submit Button -->
                    <button
                        v-if="file"
                        class="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
                        @click="submit"
                    >
                        Submit
                    </button>
                </div>
                <div v-if="loading" class="mt-5">
                    <div class="bg-gray-700 h-2.5 rounded-full">
                        <div
                            class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            :style="{ width: `${progress}%` }"
                        ></div>
                    </div>
                    <div class="text-center mt-2 text-gray-300">
                        {{ progress }}% Complete
                    </div>
                </div>
            </div>
            <div
                v-if="videoSrc"
                class="flex flex-col md:flex-row md:space-x-4 w-full max-w-6xl p-4 items-start space-y-4 md:space-y-0"
            >
                <!-- Video Section -->
                <div class="w-full md:w-1/2">
                    <video
                        v-if="videoSrc"
                        :src="videoSrc"
                        controls
                        class="w-full rounded border-2 border-gray-700"
                    ></video>
                </div>

                <!-- Recipe Section -->
                <div
                    class="w-full md:w-1/2 bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700 prose prose-invert"
                >
                    <div
                        v-if="recipe"
                        v-html="sanitizedMarkdown"
                        class="text-gray-100"
                    ></div>
                    <div
                        v-else-if="loading"
                        class="flex items-center justify-center h-full w-full text-gray-400"
                    >
                        Loading
                    </div>
                </div>
            </div>
        </main>
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
const textJob = ref<string>("");
// Handle file input
const handleFileInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    file.value = target.files?.[0] || null; // Get the first selected file, or set to null if no file selected
    videoSrc.value = URL.createObjectURL(file.value!);
};
const recipe = ref<string>("");

let eventSource: EventSource | null = null;
const progress = ref<number>(0);
const clientId = ref<string>(crypto.randomUUID());
const submit = async () => {
    if (!file.value) {
        alert("No file selected!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file.value);
    formData.append("clientId", clientId.value);
    console.log(clientId.value);
    const baseURL =
        import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    try {
        loading.value = true;
        await axios.post(baseURL + "/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
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
    const baseURL =
        import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    //create an event source for SSE.
    eventSource = new EventSource(
        `${baseURL}/events?clientId=${clientId.value}`,
    );

    eventSource.onmessage = (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            // Update progress if it exists
            if (data.progress !== undefined) {
                progress.value = Math.round(data.progress * 100);
            }

            // Update recipe if it exists
            if (data.result) {
                recipe.value = data.result;
            }
            if (data.name == "process-text") {
                textJob.value = data.jobId;
                progress.value = data.progress;
            }
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
