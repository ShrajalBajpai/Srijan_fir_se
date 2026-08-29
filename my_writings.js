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

async function loadMyPoems() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {

        window.location.href = "login.html";

        return;
    }

    const {
        data: poems,
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

        console.error("Load error:", error);

        errorMessage.textContent =
            "Unable to load your writings: " +
            error.message;

        return;
    }

    if (!poems || poems.length === 0) {

        emptyMessage.style.display = "block";

        return;
    }

    poemsContainer.innerHTML = "";

    poems.forEach(function (poem) {

        const card =
            document.createElement("div");

        card.className =
            "writing-card";

        const statusClass =
            poem.status === "published"
                ? "published"
                : "draft";

        const statusText =
            poem.status === "published"
                ? "Published"
                : "Draft";

        const date =
            poem.created_at
                ? new Date(
                    poem.created_at
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                )
                : "";

        let documentButton = "";

        // If this is an uploaded document
        if (poem.file_path) {

            documentButton = `
                <button
                    class="delete-button"
                    style="background:#8b5e3c; margin-right:10px;"
                    onclick="openDocument('${escapeHTML(poem.file_path)}')"
                >
                    📄 View Document
                </button>
            `;
        }

        card.innerHTML = `

            <span class="status ${statusClass}">
                ${statusText}
            </span>

            <h2>
                ${escapeHTML(poem.title)}
            </h2>

            <div class="writing-meta">

                Category:
                ${escapeHTML(
                    poem.category || "Poetry"
                )}

                &nbsp; • &nbsp;

                ${date}

            </div>

            <div class="writing-preview">

                ${escapeHTML(
                    poem.content || ""
                )}

            </div>

            ${documentButton}

            <button
                class="delete-button"
                onclick="deletePoem('${poem.id}')"
            >
                Delete
            </button>

        `;

        poemsContainer.appendChild(card);

    });

}


// Open uploaded document
async function openDocument(filePath) {

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

        console.error(
            "Document error:",
            error
        );

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


// Delete poem or uploaded writing
async function deletePoem(poemId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this writing?"
        );

    if (!confirmed) {
        return;
    }

    // Get file path first
    const {
        data: poem,
        error: fetchError
    } = await supabaseClient
        .from("poems")
        .select("file_path")
        .eq("id", poemId)
        .single();

    if (fetchError) {

        console.error(fetchError);

        alert(
            "Unable to find the writing."
        );

        return;
    }

    // Delete database record
    const {
        error
    } = await supabaseClient
        .from("poems")
        .delete()
        .eq("id", poemId);

    if (error) {

        console.error(error);

        alert(
            "Unable to delete the writing."
        );

        return;
    }

    // If it is an uploaded document,
    // also remove the file from Storage
    if (poem.file_path) {

        const {
            error: storageError
        } = await supabaseClient
            .storage
            .from("writings")
            .remove([
                poem.file_path
            ]);

        if (storageError) {

            console.error(
                "Storage delete error:",
                storageError
            );

        }

    }

    alert(
        "Writing deleted successfully."
    );

    window.location.reload();

}


// Prevent HTML injection
function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;
}


// Start
loadMyPoems();
