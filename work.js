import { supabase } from "./supabase.js";

const form = document.getElementById("workForm");
const publishBtn = document.getElementById("publishBtn");
const message = document.getElementById("message");

async function saveWork(status) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    message.textContent = "Please log in first.";
    return;
  }

  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  const { error } = await supabase
    .from("works")
    .insert({
      user_id: user.id,
      title: title,
      content: content,
      status: status,
      published_at: status === "published"
        ? new Date().toISOString()
        : null
    });

  if (error) {
    console.error(error);
    message.textContent = "Could not save your work.";
    return;
  }

  message.textContent =
    status === "published"
      ? "Work published!"
      : "Draft saved!";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  saveWork("draft");
});

publishBtn.addEventListener("click", () => {
  saveWork("published");
});
