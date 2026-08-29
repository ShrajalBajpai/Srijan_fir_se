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

// Check logged-in user
const {
    data: { user },
    error: userError
} = await supabaseClient.auth.getUser();


if (userError || !user) {

    window.location.href = "login.html";

    return;
}



// Get user's poems
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

    console.error(error);

    errorMessage.textContent =
        "Unable to load your writings.";

    return;
}



// No poems
if (!poems || poems.length === 0) {

    emptyMessage.style.display = "block";

    return;
}



// Display poems
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
        new Date(
            poem.created_at
        ).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );



    card.innerHTML = `

        <span class="status ${statusClass}">
            ${statusText}
        </span>

        <h2>
            ${escapeHTML(poem.title)}
        </h2>

        <div class="writing-meta">

            Category:
            ${escapeHTML(poem.category || "Poetry")}

            &nbsp; • &nbsp;

            ${date}

        </div>

        <div class="writing-preview">

            ${escapeHTML(poem.content)}

        </div>

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

// Delete poem
async function deletePoem(poemId) {

const confirmed =
    confirm(
        "Are you sure you want to delete this poem?"
    );


if (!confirmed) {
    return;
}


const {
    error
} = await supabaseClient
    .from("poems")
    .delete()
    .eq("id", poemId);


if (error) {

    console.error(error);

    alert(
        "Unable to delete the poem."
    );

    return;
}


alert(
    "Poem deleted successfully."
);


// Reload the page
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
