const menuBtn = document.getElementById("menueBtn");
const menuItems = document.getElementById("menuItem");

fetch('/getRole')
    .then(res => res.json())
    .then(data => {

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