const menuBtn = document.getElementById("menueBtn");
const menuItems = document.getElementById("menuItem");

menuBtn.addEventListener("click", () => {
    if (menuItems.style.display === "block") {
        menuItems.style.display = "none";
    } else {
        menuItems.style.display = "block";
    }
});

function showProfile() {
    console.log("Profile clicked");
}

function showEdit() {
    console.log("Edit clicked");
}