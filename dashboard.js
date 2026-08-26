const SUPABASE_URL = "https://xhtnidoouiaolljkqsus.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


async function checkUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    document.getElementById("userEmail").textContent =
        user.email;
}


document
    .getElementById("logoutButton")
    .addEventListener("click", async function () {

        await supabaseClient.auth.signOut();

        window.location.href = "index.html";

    });


checkUser();
