const SUPABASE_URL =
    "https://xhtnidoouiaolljkqsus.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-F-EydBhQh-rXBoBaHCUw_X-7peEiC";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


const poemForm =
    document.getElementById("poemForm");

const draftButton =
    document.getElementById("draftButton");

const message =
    document.getElementById("message");


// =====================================================
// CHECK IF EDITING A DRAFT
// =====================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const editPoemId =
    urlParams.get("edit");


let editingDraft = null;


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "login.html";

        return null;
    }


    return user;

}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        type;

}


// =====================================================
// LOAD DRAFT
// =====================================================

async function loadDraftForEditing() {

    // Not editing anything
    if (!editPoemId) {

        return;

    }


    const user =
        await getCurrentUser();


    if (!user) {

        return;

    }


    const {
        data: poem,
        error
    } = await supabaseClient
        .from("poems")
        .select("*")
        .eq("id", editPoemId)
        .eq("user_id", user.id)
        .eq("status", "draft")
        .single();


    if (error || !poem) {

        console.error(
            "Draft loading error:",
            error
        );


        showMessage(
            "This draft could not be found.",
            "error"
        );


        return;

    }


    editingDraft =
        poem;


    // Fill title
    document.getElementById(
        "title"
    ).value =
        poem.title || "";


    // Fill category
    document.getElementById(
        "category"
    ).value =
        poem.category || "Poetry";


    // Fill content
    document.getElementById(
        "content"
    ).value =
        poem.content || "";


    // Change heading
    const heading =
        document.querySelector(
            ".write-header h1"
        );


    if (heading) {

        heading.textContent =
            "Edit Your Draft";

    }


    // Change description
    const description =
        document.querySelector(
            ".write-header p:last-child"
        );


    if (description) {

        description.textContent =
            "Continue writing and save your changes.";

    }


    // Change submit button text
    const submitButton =
        poemForm.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Submit for Approval";

    }

}


// =====================================================
// SAVE POEM
// =====================================================

async function savePoem(
    status
) {

    const user =
        await getCurrentUser();


    if (!user) {

        return;

    }


    const title =
        document
            .getElementById("title")
            .value
            .trim();


    const content =
        document
            .getElementById("content")
            .value
            .trim();


    const category =
        document
            .getElementById("category")
            .value;


    // =================================================
    // VALIDATION
    // =================================================

    if (!title) {

        showMessage(
            "Please enter a poem title.",
            "error"
        );

        return;

    }


    if (!content) {

        showMessage(
            "Please write your poem.",
            "error"
        );

        return;

    }


    showMessage(
        "Saving your poem...",
        ""
    );


    let data;
    let error;


    // =================================================
    // EDIT EXISTING DRAFT
    // =================================================

    if (editingDraft) {

        const result =
            await supabaseClient
                .from("poems")
                .update({

                    title:
                        title,

                    content:
                        content,

                    category:
                        category,

                    status:
                        status,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    editingDraft.id
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "status",
                    "draft"
                )
                .select();


        data =
            result.data;

        error =
            result.error;

    }


    // =================================================
    // CREATE NEW POEM
    // =================================================

    else {

        const result =
            await supabaseClient
                .from("poems")
                .insert({

                    user_id:
                        user.id,

                    title:
                        title,

                    content:
                        content,

                    category:
                        category,

                    status:
                        status

                })
                .select();


        data =
            result.data;

        error =
            result.error;

    }


    // =================================================
    // ERROR
    // =================================================

    if (error) {

        console.error(
            "Supabase error:",
            error
        );


        showMessage(
            "Error: " +
            error.message,
            "error"
        );


        return;

    }


    console.log(
        "Poem saved:",
        data
    );


    // =================================================
    // SUCCESS MESSAGE
    // =================================================

    if (status === "draft") {

        showMessage(
            "Your draft has been saved successfully.",
            "success"
        );

    }

    else if (status === "pending") {

        showMessage(
            "Your poem has been submitted for admin approval.",
            "success"
        );

    }


    // =================================================
    // RESET EDIT MODE
    // =================================================

    editingDraft = null;


    poemForm.reset();


    // Go back to My Writings after short delay
    setTimeout(
        function () {

            window.location.href =
                "my_writings.html";

        },
        1500
    );

}


// =====================================================
// SUBMIT FOR APPROVAL
// =====================================================

poemForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        await savePoem(
            "pending"
        );

    }
);


// =====================================================
// SAVE DRAFT
// =====================================================

draftButton.addEventListener(
    "click",
    async function() {

        await savePoem(
            "draft"
        );

    }
);


// =====================================================
// START
// =====================================================

async function startPage() {

    const user =
        await getCurrentUser();


    if (!user) {

        return;

    }


    await loadDraftForEditing();

}


startPage();
