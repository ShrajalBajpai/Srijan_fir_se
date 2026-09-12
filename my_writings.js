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


// =====================================================
// LOAD USER'S WRITINGS
// =====================================================

async function loadMyPoems() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

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

        console.error(
            "Load error:",
            error
        );

        errorMessage.textContent =
            "Unable to load your writings: " +
            error.message;

        return;
    }


    if (!poems || poems.length === 0) {

        emptyMessage.style.display =
            "block";

        return;
    }


    poemsContainer.innerHTML = "";


    poems.forEach(function (poem) {

        const card =
            document.createElement("div");

        card.className =
            "writing-card";


        // =================================================
        // STATUS
        // =================================================

        let statusClass = "draft";

        let statusText = "Draft";


        if (poem.status === "published") {

            statusClass = "published";
            statusText = "Published";

        }

        else if (poem.status === "pending") {

            statusClass = "pending";
            statusText = "Waiting for Approval";

        }

        else if (poem.status === "rejected") {

            statusClass = "rejected";
            statusText = "Rejected";

        }


        // =================================================
        // DATE
        // =================================================

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


        // =================================================
        // DOCUMENT BUTTON
        // =================================================

        let documentButton = "";


        if (poem.file_path) {

            documentButton = `

                <button
                    class="edit-button"
                    style="
                        background:#8b5e3c;
                        margin-right:10px;
                    "
                    onclick="openDocument('${escapeHTML(
                        poem.file_path
                    )}')"
                >
                    📄 View Document
                </button>

            `;

        }


        // =================================================
        // EDIT BUTTON
        // ONLY DRAFTS CAN BE EDITED
        // =================================================

        let editButton = "";


        if (poem.status === "draft") {

            editButton = `

                <button
                    class="edit-button"
                    onclick="editPoem('${poem.id}')"
                >
                    ✏️ Edit Draft
                </button>

            `;

        }


        // =================================================
        // REJECTION MESSAGE
        // =================================================

        let rejectionMessage = "";


        if (
            poem.status === "rejected" &&
            poem.rejection_reason
        ) {

            rejectionMessage = `

                <div
                    style="
                        margin-top:15px;
                        padding:12px;
                        background:#ffe5e5;
                        color:#9b2222;
                        border-radius:8px;
                    "
                >

                    <strong>
                        Admin's reason:
                    </strong>

                    <br>

                    ${escapeHTML(
                        poem.rejection_reason
                    )}

                </div>

            `;

        }


        // =================================================
        // CARD
        // =================================================

        card.innerHTML = `

            <span
                class="status ${statusClass}"
            >
                ${statusText}
            </span>


            <h2>
                ${escapeHTML(
                    poem.title
                )}
            </h2>


            <div class="writing-meta">

                Category:
                ${escapeHTML(
                    poem.category ||
                    "Poetry"
                )}

                &nbsp; • &nbsp;

                ${date}

            </div>


            <div class="writing-preview">

                ${escapeHTML(
                    poem.content || ""
                )}

            </div>


            ${rejectionMessage}


            <div
                style="
                    margin-top:15px;
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                "
            >

                ${documentButton}

                ${editButton}


                <button
                    class="delete-button"
                    onclick="deletePoem('${poem.id}')"
                >
                    Delete
                </button>

            </div>

        `;


        poemsContainer.appendChild(card);

    });

}


// =====================================================
// EDIT DRAFT
// =====================================================

function editPoem(poemId) {

    window.location.href =
        "write.html?edit=" +
        encodeURIComponent(poemId);

}


// =====================================================
// OPEN UPLOADED DOCUMENT
// =====================================================

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


// =====================================================
// DELETE WRITING
// =====================================================

async function deletePoem(poemId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this writing?"
        );


    if (!confirmed) {
        return;
    }


    // Get file path
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


    // Delete uploaded file
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


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


// =====================================================
// START
// =====================================================

loadMyPoems();
