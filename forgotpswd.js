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
"forgotPasswordForm"
);

const emailInput =
document.getElementById(
"email"
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


    const email =
        emailInput.value
            .trim();


    if (!email) {

        showMessage(
            "Please enter your email address.",
            "error"
        );

        return;
    }


    resetButton.disabled =
        true;

    resetButton.textContent =
        "Sending...";


    showMessage(
        "",
        ""
    );


    const {
        error
    } = await supabaseClient.auth
        .resetPasswordForEmail(
            email,
            {
                redirectTo:
                    window.location.origin +
                    "/resetpswd.html"
            }
        );


    if (error) {

        console.error(
            "Password reset error:",
            error
        );


        showMessage(
            "Unable to send reset link: " +
            error.message,
            "error"
        );


        resetButton.disabled =
            false;

        resetButton.textContent =
            "Send Reset Link";

        return;
    }


    showMessage(
        "Password reset link has been sent to your email. Please check your inbox.",
        "success"
    );


    resetButton.disabled =
        false;

    resetButton.textContent =
        "Send Reset Link";

}


);
