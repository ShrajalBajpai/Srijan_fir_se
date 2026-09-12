const SUPABASE_URL =
"https://xhtnidoouiaolljkqsus.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
"sb_publishable_W-F-EydBhQh-rXBoBaHCUw_X-7peEiC";

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_PUBLISHABLE_KEY
);

const form =
document.getElementById(
"resetPasswordForm"
);

const passwordInput =
document.getElementById(
"password"
);

const confirmPasswordInput =
document.getElementById(
"confirmPassword"
);

const resetButton =
document.getElementById(
"resetButton"
);

const message =
document.getElementById(
"message"
);

function showMessage(
text,
type
) {

message.textContent =
    text;

message.className =
    type;


}

form.addEventListener(
"submit",
async function(event) {

    event.preventDefault();


    const password =
        passwordInput.value;


    const confirmPassword =
        confirmPasswordInput.value;


    if (password.length < 6) {

        showMessage(
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }


    if (
        password !==
        confirmPassword
    ) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    resetButton.disabled =
        true;

    resetButton.textContent =
        "Updating...";


    const {
        error
    } = await supabaseClient.auth
        .updateUser({
            password: password
        });


    if (error) {

        console.error(
            "Password update error:",
            error
        );


        showMessage(
            "Unable to update password: " +
            error.message,
            "error"
        );


        resetButton.disabled =
            false;

        resetButton.textContent =
            "Update Password";

        return;
    }


    showMessage(
        "Password updated successfully! Redirecting to login...",
        "success"
    );


    setTimeout(
        async function() {

            await supabaseClient
                .auth
                .signOut();

            window.location.href =
                "login.html";

        },
        2000
    );

}


);
