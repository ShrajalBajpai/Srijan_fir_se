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
// ELEMENTS
// =====================================================

const submissionsContainer =
    document.getElementById(
        "submissionsContainer"
    );

const loading =
    document.getElementById(
        "loading"
    );

const message =
    document.getElementById(
        "message"
    );

const adminEmail =
    document.getElementById(
        "adminEmail"
    );


// Current tab
let currentStatus = "pending";


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(text, color = "") {

    message.textContent = text;

    message.style.color = color;

}


// =====================================================
// CHECK LOGIN + ADMIN
// =====================================================

async function checkAdmin() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    // User is not logged in
    if (userError || !user) {

        window.location.href =
            "login.html";

        return null;
    }


    // Show admin email
    adminEmail.textContent =
        "Logged in as: " +
        user.email;


    // Check admin_users table
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

        document.body.innerHTML = `

            <div class="admin-error">

                <h1>
                    Admin verification failed
                </h1>

                <p>
                    ${escapeHTML(
                        adminError.message
                    )}
                </p>

                <a
                    href="dashboard.html"
                    class="back-button"
                >
                    Back to Dashboard
                </a>

            </div>

        `;

        return null;
    }


    // User is NOT an admin
    if (!admin) {

        document.body.innerHTML = `

            <div class="admin-error">

                <h1>
                    Access Denied
                </h1>

                <p>
                    You are not authorized to access
                    the admin dashboard.
                </p>

                <a
                    href="dashboard.html"
                    class="back-button"
                >
                    Back to Dashboard
                </a>

            </div>

        `;

        return null;
    }


    // User is admin
    return user;
}


// =====================================================
// LOAD SUBMISSIONS
// =====================================================

async function loadSubmissions(status) {

    currentStatus = status;


    updateActiveTab(status);


    loading.style.display =
        "block";

    submissionsContainer.innerHTML =
        "";

    showMessage("");


    const {
        data: poems,
        error
    } = await supabaseClient
        .from("poems")
        .select("*")
        .eq("status", status)
        .order("created_at", {
            ascending: false
        });


    loading.style.display =
        "none";


    if (error) {

        console.error(
            "Load submissions error:",
            error
        );

        showMessage(
            "Unable to load submissions: " +
            error.message,
            "#b00020"
        );

        return;
    }


    if (!poems ||
        poems.length === 0) {

        submissionsContainer.innerHTML = `

            <div class="empty-message">

                ${
                    status === "pending"
                        ? `
                            <h2>
                                No Pending Submissions
                            </h2>

                            <p>
                                There are no writings waiting
                                for approval.
                            </p>
                          `
                        : status === "published"
                        ? `
                            <h2>
                                No Published Writings
                            </h2>

                            <p>
                                No writings have been published yet.
                            </p>
                          `
                        : `
                            <h2>
                                No Rejected Writings
                            </h2>

                            <p>
                                There are no rejected writings.
                            </p>
                          `
                }

            </div>

        `;

        return;
    }


    poems.forEach(
        function(poem) {

            createSubmissionCard(
                poem
            );

        }
    );
}


// =====================================================
// CREATE SUBMISSION CARD
// =====================================================

function createSubmissionCard(poem) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "submission-card";


    // Date
    let date = "";

    if (poem.created_at) {

        date =
            new Date(
                poem.created_at
            ).toLocaleString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    }


    // Status class
    let statusClass =
        "status-pending";

    if (poem.status === "published") {

        statusClass =
            "status-published";

    }

    if (poem.status === "rejected") {

        statusClass =
            "status-rejected";

    }


    // Uploaded document
    let documentHTML = "";


    if (poem.file_path) {

        documentHTML = `

            <div class="file-name">

                📄

                <strong>
                    Uploaded document:
                </strong>

                ${escapeHTML(
                    poem.file_name ||
                    "Document"
                )}

            </div>

        `;

    }


    // Rejection reason
    let rejectionHTML = "";


    if (
        poem.status === "rejected" &&
        poem.rejection_reason
    ) {

        rejectionHTML = `

            <div class="file-name">

                <strong>
                    Rejection reason:
                </strong>

                ${escapeHTML(
                    poem.rejection_reason
                )}

            </div>

        `;

    }


    // Buttons
    let buttonsHTML = "";


    if (poem.status === "pending") {

        buttonsHTML = `

            <div class="admin-actions">

                ${
                    poem.file_path
                        ? `
                            <button
                                class="admin-button document-button"
                                onclick="openDocument('${escapeHTML(
                                    poem.file_path
                                )}')"
                            >
                                📄 View Document
                            </button>
                          `
                        : ""
                }

                <button
                    class="admin-button approve-button"
                    onclick="approvePoem('${poem.id}')"
                >
                    ✓ Approve & Publish
                </button>

                <button
                    class="admin-button reject-button"
                    onclick="rejectPoem('${poem.id}')"
                >
                    ✕ Reject
                </button>

            </div>

        `;

    } else {

        buttonsHTML = `

            <div class="admin-actions">

                ${
                    poem.file_path
                        ? `
                            <button
                                class="admin-button document-button"
                                onclick="openDocument('${escapeHTML(
                                    poem.file_path
                                )}')"
                            >
                                📄 View Document
                            </button>
                          `
                        : ""
                }

            </div>

        `;

    }


    card.innerHTML = `

        <span class="status ${statusClass}">

            ${escapeHTML(
                poem.status
                    .toUpperCase()
            )}

        </span>


        <h2>

            ${escapeHTML(
                poem.title
            )}

        </h2>


        <div class="submission-meta">

            <strong>
                Category:
            </strong>

            ${escapeHTML(
                poem.category ||
                "Other"
            )}

            <br>


            <strong>
                Submitted:
            </strong>

            ${date}

            <br>


            <strong>
                User ID:
            </strong>

            ${escapeHTML(
                poem.user_id
            )}

        </div>


        ${documentHTML}


        <div class="submission-content">

            ${escapeHTML(
                poem.content ||
                ""
            )}

        </div>


        ${rejectionHTML}


        ${buttonsHTML}

    `;


    submissionsContainer.appendChild(
        card
    );
}


// =====================================================
// APPROVE POEM
// =====================================================

async function approvePoem(poemId) {

    const confirmed =
        confirm(
            "Are you sure you want to approve this writing?"
        );


    if (!confirmed) {
        return;
    }


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("poems")
        .update({

            status:
                "published",

            approved_by:
                user.id,

            approved_at:
                new Date().toISOString(),

            rejection_reason:
                null

        })
        .eq("id", poemId)
        .eq("status", "pending");


    if (error) {

        console.error(
            "Approve error:",
            error
        );

        alert(
            "Unable to approve the writing:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Writing approved and published successfully!"
    );


    await loadSubmissions(
        currentStatus
    );
}


// =====================================================
// REJECT POEM
// =====================================================

async function rejectPoem(poemId) {

    const reason =
        prompt(
            "Please enter the reason for rejection:"
        );


    if (
        reason === null ||
        !reason.trim()
    ) {

        return;
    }


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("poems")
        .update({

            status:
                "rejected",

            rejection_reason:
                reason.trim(),

            approved_by:
                null,

            approved_at:
                null

        })
        .eq("id", poemId)
        .eq("status", "pending");


    if (error) {

        console.error(
            "Reject error:",
            error
        );

        alert(
            "Unable to reject the writing:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Writing has been rejected."
    );


    await loadSubmissions(
        currentStatus
    );
}


// =====================================================
// OPEN DOCUMENT
// =====================================================

async function openDocument(
    filePath
) {

    if (!filePath) {

        alert(
            "No document found."
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .storage
        .from("writings")
        .createSignedUrl(
            filePath,
            3600
        );


    if (error) {

        console.error(
            "Document error:",
            error
        );

        alert(
            "Unable to open the document:\n\n" +
            error.message
        );

        return;
    }


    window.open(
        data.signedUrl,
        "_blank"
    );
}


// =====================================================
// TAB MANAGEMENT
// =====================================================

function updateActiveTab(
    status
) {

    document
        .getElementById(
            "pendingTab"
        )
        .classList.remove(
            "active"
        );

    document
        .getElementById(
            "publishedTab"
        )
        .classList.remove(
            "active"
        );

    document
        .getElementById(
            "rejectedTab"
        )
        .classList.remove(
            "active"
        );


    if (status === "pending") {

        document
            .getElementById(
                "pendingTab"
            )
            .classList.add(
                "active"
            );

    }


    if (status === "published") {

        document
            .getElementById(
                "publishedTab"
            )
            .classList.add(
                "active"
            );

    }


    if (status === "rejected") {

        document
            .getElementById(
                "rejectedTab"
            )
            .classList.add(
                "active"
            );

    }

}


// =====================================================
// REFRESH CURRENT TAB
// =====================================================

function refreshCurrentTab() {

    loadSubmissions(
        currentStatus
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text || "";

    return div.innerHTML;
}


// =====================================================
// START ADMIN DASHBOARD
// =====================================================

async function startAdminDashboard() {

    const user =
        await checkAdmin();


    if (!user) {
        return;
    }


    // Load pending submissions
    await loadSubmissions(
        "pending"
    );
}


startAdminDashboard();
