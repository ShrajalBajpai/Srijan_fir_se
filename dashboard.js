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
// START DASHBOARD
// =====================================================

async function startDashboard() {

    // Get logged-in user
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    // Not logged in
    if (userError || !user) {

        window.location.href = "login.html";

        return;
    }


    // Show email
    const userEmail =
        document.getElementById("userEmail");

    if (userEmail) {

        userEmail.textContent =
            user.email;

    }


    console.log("Logged-in email:", user.email);
    console.log("Logged-in user ID:", user.id);


    // =================================================
    // CHECK ADMIN
    // =================================================

    const {
        data: admin,
        error: adminError
    } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();


    if (adminError) {

        console.error(
            "Admin check error:",
            adminError
        );

        return;
    }


    console.log(
        "Admin record:",
        admin
    );


    // User is admin
    if (admin) {

        console.log(
            "✅ THIS USER IS AN ADMIN"
        );


        const adminOption =
            document.getElementById(
                "adminOption"
            );


        if (adminOption) {

            adminOption.style.display =
                "block";

        }

    } else {

        console.log(
            "❌ THIS USER IS NOT AN ADMIN"
        );

    }

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
// RUN
// =====================================================

startDashboard();
