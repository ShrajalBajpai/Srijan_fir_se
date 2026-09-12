const SUPABASE_URL =
    "https://xhtnidoouiaolljkqsus.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-F-EydBhQh-rXBoBaHCUw_X-7peEiC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =====================================================
// CHECK LOGGED-IN USER
// =====================================================

async function checkUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "login.html";

        return;
    }


    document.getElementById(
        "userEmail"
    ).textContent =
        user.email;
}


// =====================================================
// LOGOUT
// =====================================================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        async function () {

            await supabaseClient
                .auth
                .signOut();

            window.location.href =
                "index.html";

        }
    );


// =====================================================
// CHECK IF USER IS ADMIN
// =====================================================

async function checkAdmin() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();


    if (error) {

        console.error(
            "Admin check error:",
            error
        );

        return;
    }


    // If this user exists in admin_users,
    // show the Admin Panel button.
    if (data) {

        const adminOption =
            document.getElementById(
                "adminOption"
            );

        if (adminOption) {

            adminOption.style.display =
                "block";

        }
    }
}


// =====================================================
// START
// =====================================================

checkUser();

checkAdmin();
