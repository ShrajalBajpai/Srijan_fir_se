async function checkUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {

        window.location.href = "login.html";

        return;
    }

    document.getElementById("userEmail").textContent =
        user.email;
}


document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        async function () {

            await supabaseClient.auth.signOut();

            window.location.href =
                "index.html";

        }
    );


checkUser();
