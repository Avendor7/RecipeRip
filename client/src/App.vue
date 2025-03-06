<template>
    <div class="min-h-screen bg-blue-100 dark:bg-gray-900 flex flex-col">
        <header class="relative bg-gray-800/80 backdrop-blur-sm text-white py-6 shadow-lg">
            <h1 class="text-4xl md:text-5xl font-bold text-center tracking-tight">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Recipe</span>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Rip</span>
            </h1>

            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        </header>
        <main class="flex-grow relative">
            <div :class="['transition-all duration-500 ease-in-out', !videoSrc ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full absolute', 'w-full',]">
                <!-- Upload Card -->
                <div class="min-h-[80vh] flex items-center justify-center px-4">
                    <div class="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700 max-w-xl w-full">
                        <h2 class="text-2xl font-semibold mb-6 text-gray-100 text-center">
                            Upload Your Recipe Video
                        </h2>

                        <label class="block w-full p-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-850 hover:bg-gray-750 text-center" for="fileInput">
                                <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                </svg>
                                <span class="text-gray-300 text-lg">Click to browse</span>
                                <br>
                                <span class="text-gray-400 text-sm">MP4, MP3 Supported</span>
                            <input id="fileInput" type="file" class="hidden" accept="video/*" @change="handleFileInput"/>
                        </label>

                        <button v-if="file" class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors text-lg" @click="submit">
                            Process Video
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="videoSrc" class="min-h-[90vh] flex flex-col lg:flex-row">
                <!-- Video Section -->
                <div class="lg:w-1/3 bg-gray-800 rounded-lg m-4 mr-0 p-4 lg:min-h-[80vh] lg:max-h-[90vh] flex flex-col">

                <!-- Minimized Upload Section -->

                    <div
                        class="flex-grow bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                    >
                        <video
                            v-if="videoSrc"
                            :src="videoSrc"
                            controls
                            class="w-full h-full object-cover"
                        ></video>
                    </div>
                    <div class="bg-gray-800 rounded-lg mt-4 shadow-md">
                        <div class="flex items-center pb-3">
                            <input
                                type="file"
                                class="hidden"
                                id="newFileInput"
                                @change="handleFileInput"
                            />
                            <label
                                for="newFileInput"
                                class="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-center cursor-pointer flex-grow text-white text-md"
                            >
                                Choose Another Video
                            </label>
                        </div>
                        <div class="flex items-center">
                            <button
                                v-if="file"
                                class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:bg-blue-700 px-4 py-3 rounded-lg cursor-pointer flex-grow text-white text-md"
                                @click="submit"
                            >
                                Process
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Recipe Section -->

                <div
                    class="lg:w-2/3 bg-gray-850 p-4 lg:min-h-[90vh] flex flex-col"
                >
                    <div
                        class="bg-gray-800 rounded-lg shadow-xl p-8 h-full"
                    >
                        <div
                            v-if="recipe"
                            v-html="sanitizedMarkdown"
                            class="text-gray-100 prose prose-invert prose-lg max-w-none"
                        ></div>
                        <div
                            v-else-if="loading"
                            class="flex flex-col items-center justify-center h-full text-gray-400"
                        >
                            <div class="w-full max-w-md">
                                <div
                                    class="bg-gray-700 h-2 rounded-full overflow-hidden"
                                >
                                    <div
                                        class="bg-blue-600 h-full rounded-full transition-all duration-300"
                                        :style="{ width: `${progress}%` }"
                                    ></div>
                                </div>
                                <div
                                    class="text-center mt-4 text-gray-300 text-lg"
                                >
                                    Extracting Recipe... {{ progress }}%
                                </div>
                            </div>
                        </div>
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
            if (data.result && data.progress === 1) {
                recipe.value = data.result;
                loading.value = false;
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
