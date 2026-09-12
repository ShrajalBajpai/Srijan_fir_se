const SUPABASE_URL =
    "https://xhtnidoouiaolljkqsus.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_W-F-EydBhQh-rXBoBaHCUw_X-7peEiC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


const resetForm =
    document.getElementById("resetForm");

const resetButton =
    document.getElementById("resetButton");

const message =
    document.getElementById("message");


// Show message
function showMessage(text, type) {

    message.textContent = text;
    message.className = type;

}


// Reset password
resetForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const password =
            document
                .getElementById("password")
                .value;

        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        // Check password length
        if (password.length < 6) {

            showMessage(
                "Password must be at least 6 characters.",
                "error"
            );

            return;
        }


        // Check passwords match
        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        resetButton.disabled = true;

        resetButton.textContent =
            "Updating...";


        // Update Supabase password
        const {
            error
        } = await supabaseClient.auth.updateUser({

            password: password

        });


        if (error) {

            console.error(
                "Password update error:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            resetButton.disabled = false;

            resetButton.textContent =
                "Update Password";

            return;
        }


        // Success
        showMessage(
            "Password updated successfully!",
            "success"
        );


        resetButton.textContent =
            "Password Updated";


        // Sign out
        await supabaseClient.auth.signOut();


        // Go back to login
        setTimeout(function () {

            window.location.href =
                "login.html";

        }, 2000);

    }
);
