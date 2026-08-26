const SUPABASE_URL = "https://xhtnidoouiaolljkqsus.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_PUBLISHABLE_KEY_HERE";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


let isLogin = false;


const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");

const switchText = document.getElementById("switchText");
const switchButton = document.getElementById("switchButton");

const message = document.getElementById("message");


/* Switch between Login and Register */

switchButton.addEventListener("click", function () {

    isLogin = !isLogin;

    if (isLogin) {

        formTitle.textContent = "Login";

        submitButton.textContent = "Login";

        switchText.textContent =
            "Don't have an account?";

        switchButton.textContent =
            "Register";

    } else {

        formTitle.textContent = "Create Account";

        submitButton.textContent = "Register";

        switchText.textContent =
            "Already have an account?";

        switchButton.textContent =
            "Login";
    }

    message.textContent = "";
});


/* Register / Login */

authForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    message.textContent = "Please wait...";

    try {

        if (isLogin) {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            message.textContent =
                "Login successful!";

            window.location.href =
                "dashboard.html";

        } else {

            const { data, error } =
                await supabaseClient.auth.signUp({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            message.textContent =
                "Registration successful! Check your email to confirm your account.";

        }

    } catch (error) {

        console.error(error);

        message.textContent =
            error.message;
    }

});
