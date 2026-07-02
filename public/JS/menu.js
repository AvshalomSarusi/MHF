const menuBtn = document.getElementById("menueBtn");
const menuItems = document.getElementById("menuItem");

fetch('/getRole')
    .then(res => res.json())
    .then(data => {

        // cache the role in a readable cookie so the NEXT page can style itself
        // before first paint (prevents the layout jump on navigation). also
        // self-heals sessions that logged in before this cookie existed.
        document.cookie = 'mhf_role=' + data.role + ';path=/;max-age=604800;samesite=strict';

        if (data.role === 'admin') {
            document.body.classList.add('admin');

            if (menuItems) {
                menuItems.style.display = "flex";
            }

            if (menuBtn) {
                menuBtn.style.display = "none";
            }

            return;
        }

        if (menuBtn && menuItems) {
            menuBtn.addEventListener("click", () => {
                if (menuItems.style.display === "block") {
                    menuItems.style.display = "none";
                } else {
                    menuItems.style.display = "block";
                }
            });
        }
    });