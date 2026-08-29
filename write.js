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

async function getCurrentUser() {

const {
    data: { user },
    error
} = await supabaseClient.auth.getUser();


if (error || !user) {

    window.location.href = "login.html";

    return null;
}


return user;


}

function showMessage(text, type) {

message.textContent = text;

message.className = type;


}

async function savePoem(status) {

    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    console.log("Authenticated user:", user);
    console.log("User ID:", user.id);

    // keep the rest of your existing code here

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



const {
    data,
    error
} = await supabaseClient
    .from("poems")
    .insert({

        user_id: user.id,

        title: title,

        content: content,

        category: category,

        status: status

    })
    .select();



if (error) {

    console.error(
        "Supabase error:",
        error
    );

    showMessage(
        "Error: " + error.message,
        "error"
    );

    return;
}



console.log(
    "Poem saved:",
    data
);



if (status === "draft") {

    showMessage(
        "Your poem has been saved as a draft.",
        "success"
    );

} else {

    showMessage(
        "Your poem has been published successfully!",
        "success"
    );

}



poemForm.reset();


}

// Publish
poemForm.addEventListener(
"submit",
async function(event) {

    event.preventDefault();

    await savePoem("published");

}


);

// Save draft
draftButton.addEventListener(
"click",
async function() {

    await savePoem("draft");

}


);

// Check login when page opens
getCurrentUser();
