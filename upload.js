const SUPABASE_URL =
"https://xhtnidoouiaolljkqsus.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
"sb_publishable_W-F-EydBhQh-rXBoBaHCUw_X-7peEiC";

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_PUBLISHABLE_KEY
);

const uploadForm =
document.getElementById("uploadForm");

const uploadButton =
document.getElementById("uploadButton");

const message =
document.getElementById("message");

function showMessage(text, type) {

message.textContent = text;
message.className = type;


}

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

uploadForm.addEventListener(
"submit",
async function(event) {

    event.preventDefault();


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


    const category =
        document
            .getElementById("category")
            .value;


    const file =
        document
            .getElementById("writingFile")
            .files[0];



    if (!title) {

        showMessage(
            "Please enter a title.",
            "error"
        );

        return;
    }



    if (!file) {

        showMessage(
            "Please choose a file.",
            "error"
        );

        return;
    }



    // Allowed file types
    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];


    if (!allowedTypes.includes(file.type)) {

        showMessage(
            "Please upload only PDF, DOC or DOCX files.",
            "error"
        );

        return;
    }



    // Maximum file size: 10 MB
    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        showMessage(
            "File must be smaller than 10 MB.",
            "error"
        );

        return;
    }



    uploadButton.disabled = true;

    uploadButton.textContent =
        "Uploading...";


    showMessage(
        "",
        ""
    );



    // Create a unique file path
    const fileExtension =
        file.name
            .split(".")
            .pop();

const uniqueId =
    Date.now() +
    "-" +
    Math.random()
        .toString(36)
        .substring(2, 10);

const filePath =
    user.id +
    "/" +
    uniqueId +
    "." +
    fileExtension;



    // Upload file to Supabase Storage
    const {
        error: uploadError
    } = await supabaseClient
        .storage
        .from("writings")
        .upload(
            filePath,
            file,
            {
                contentType: file.type,
                upsert: false
            }
        );



    if (uploadError) {

        console.error(uploadError);

        showMessage(
            "File upload failed: " +
            uploadError.message,
            "error"
        );

        uploadButton.disabled = false;

        uploadButton.textContent =
            "Upload Writing";

        return;
    }



    // Save information in poems table
    const {
        error: databaseError
    } = await supabaseClient
        .from("poems")
        .insert({

            user_id: user.id,

            title: title,

            content:
                "Uploaded document: " +
                file.name,

            category: category,

            status: "published",

            file_path: filePath,

            file_name: file.name,

            content_type: file.type

        });



    // If database insert fails,
    // remove the uploaded file
    if (databaseError) {

        console.error(databaseError);


        await supabaseClient
            .storage
            .from("writings")
            .remove([
                filePath
            ]);


        showMessage(
            "Could not save the writing: " +
            databaseError.message,
            "error"
        );


        uploadButton.disabled = false;

        uploadButton.textContent =
            "Upload Writing";

        return;
    }



    showMessage(
        "Your writing was uploaded successfully!",
        "success"
    );


    uploadForm.reset();


    uploadButton.disabled = false;

    uploadButton.textContent =
        "Upload Writing";

}


);

// Check authentication when page loads
getCurrentUser();
