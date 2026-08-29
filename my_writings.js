const SUPABASE_URL =
"https://xhtnidoouiaolljkqsus.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
"sb_publishable_W-F-EydBhQh-rXBoBaHCUw_X-7peEiC";

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_PUBLISHABLE_KEY
);

const poemsContainer =
document.getElementById("poemsContainer");

const loading =
document.getElementById("loading");

const emptyMessage =
document.getElementById("emptyMessage");

const errorMessage =
document.getElementById("errorMessage");

// --------------------------------------------------
// Load user's writings
// --------------------------------------------------

async function loadMyWritings() {

// Check logged-in user
const {
    data: { user },
    error: userError
} = await supabaseClient.auth.getUser();


if (userError || !user) {

    window.location.href = "login.html";

    return;
}


// Get user's writings
const {
    data: writings,
    error
} = await supabaseClient
    .from("poems")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
        ascending: false
    });


loading.style.display = "none";


if (error) {

    console.error(error);

    errorMessage.textContent =
        "Unable to load your writings.";

    return;
}


// No writings
if (!writings || writings.length === 0) {

    emptyMessage.style.display = "block";

    return;
}


// Display writings
writings.forEach(function (writing) {

    const card =
        document.createElement("div");

    card.className =
        "writing-card";


    const statusClass =
        writing.status === "published"
            ? "published"
            : "draft";


    const statusText =
        writing.status === "published"
            ? "Published"
            : "Draft";


    const date =
        new Date(
            writing.created_at
        ).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    // Check whether this is an uploaded document
    const isUploadedFile =
        !!writing.file_path;


    let preview = "";


    if (isUploadedFile) {

        preview = `
            <div class="writing-preview">
                📄 ${escapeHTML(
                    writing.file_name || "Uploaded document"
                )}
            </div>
        `;

    } else {

        preview = `
            <div class="writing-preview">
                ${escapeHTML(writing.content)}
            </div>
        `;
    }


    // View button for uploaded files
    let viewButton = "";


    if (isUploadedFile) {

        viewButton = `
            <button
                class="write-new"
                onclick="viewWriting('${writing.file_path}')"
            >
                👁️ View
            </button>
        `;
    }


    card.innerHTML = `

        <span class="status ${statusClass}">
            ${statusText}
        </span>

        <h2>
            ${escapeHTML(writing.title)}
        </h2>

        <div class="writing-meta">

            Category:
            ${escapeHTML(
                writing.category || "Poetry"
            )}

            &nbsp; • &nbsp;

            ${date}

            ${
                isUploadedFile
                    ? "&nbsp; • &nbsp; 📄 Uploaded File"
                    : "&nbsp; • &nbsp; ✍️ Poem"
            }

        </div>

        ${preview}

        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
            margin-top:20px;
        ">

            ${viewButton}

            <button
                class="delete-button"
                onclick="deleteWriting(
                    '${writing.id}',
                    '${writing.file_path || ""}'
                )"
            >
                🗑️ Delete
            </button>

        </div>

    `;


    poemsContainer.appendChild(card);

});


}

// --------------------------------------------------
// View uploaded document
// --------------------------------------------------

async function viewWriting(filePath) {

if (!filePath) {
    return;
}


const {
    data,
    error
} = await supabaseClient
    .storage
    .from("writings")
    .createSignedUrl(
        filePath,
        3600
    );


if (error) {

    console.error(error);

    alert(
        "Unable to open the document."
    );

    return;
}


window.open(
    data.signedUrl,
    "_blank"
);


}

// --------------------------------------------------
// Delete writing
// --------------------------------------------------

async function deleteWriting(
writingId,
filePath
) {

const confirmed =
    confirm(
        "Are you sure you want to delete this writing?"
    );


if (!confirmed) {
    return;
}


// Delete uploaded file from Storage
if (filePath) {

    const {
        error: storageError
    } = await supabaseClient
        .storage
        .from("writings")
        .remove([
            filePath
        ]);


    if (storageError) {

        console.error(
            "Storage delete error:",
            storageError
        );

        alert(
            "Unable to delete the uploaded file."
        );

        return;
    }
}


// Delete database record
const {
    error
} = await supabaseClient
    .from("poems")
    .delete()
    .eq("id", writingId);


if (error) {

    console.error(error);

    alert(
        "Unable to delete the writing."
    );

    return;
}


alert(
    "Writing deleted successfully."
);


// Reload page
window.location.reload();


}

// --------------------------------------------------
// Prevent HTML injection
// --------------------------------------------------

function escapeHTML(text) {

const div =
    document.createElement("div");

div.textContent =
    text || "";

return div.innerHTML;


}

// --------------------------------------------------
// Start
// --------------------------------------------------

loadMyWritings();
