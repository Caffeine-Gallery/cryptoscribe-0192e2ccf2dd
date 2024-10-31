import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Load initial posts
    await loadPosts();

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showPostForm);
    document.getElementById('cancelBtn').addEventListener('click', hidePostForm);
    document.getElementById('createPostForm').addEventListener('submit', handleSubmit);
});

async function loadPosts() {
    showLoading();
    try {
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
    hideLoading();
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const date = new Date(Number(post.timestamp) / 1000000); // Convert nano to milliseconds
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="author">By ${post.author}</span>
                <span class="date">${date.toLocaleDateString()}</span>
            </div>
            <div class="post-content">${post.body}</div>
        `;
        postsContainer.appendChild(postElement);
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    showLoading();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const body = quill.root.innerHTML;

    try {
        await backend.createPost(title, body, author);
        await loadPosts();
        hidePostForm();
        resetForm();
    } catch (error) {
        console.error('Error creating post:', error);
    }

    hideLoading();
}

function showPostForm() {
    document.getElementById('postForm').classList.remove('hidden');
}

function hidePostForm() {
    document.getElementById('postForm').classList.add('hidden');
    resetForm();
}

function resetForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    quill.setContents([]);
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}
