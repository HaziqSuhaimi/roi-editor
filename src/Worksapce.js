const init = () => {
  const imgCanvas = document.createElement("canvas");
  imgCanvas.id = "editor";
  imgCanvas.classList.add(
    "border",
    "border-primary",
    "position-relative",
    "z-1"
  );
  imgCanvas.style.backgroundImage = `radial-gradient(
    circle,
    rgb(189, 190, 233) 1px,
    rgba(0, 0, 0, 0) 1px
  )`;
  imgCanvas.style.backgroundSize = "1rem 1rem";

  const drawCanvas = document.createElement("canvas");
  imgCanvas.id = "canvas2";
  drawCanvas.classList.add("position-absolute", "top-0", "z-2");
  return imgCanvas;
};

const menuItems = [
  { id: "menu-move", name: "Move", additionalClasslist: [] },
  { id: "menu-label", name: "Label", additionalClasslist: [] },
  { id: "menu-lock", name: "Deselect", additionalClasslist: ["d-none"] },
  { id: "menu-delete", name: "Delete", additionalClasslist: ["text-danger"] },
];

const renderMenu = () => {
  const menu = document.createElement("div");
  menu.id = "menu";
  menu.classList.add("dropdown-menu", "position-absolute", "z-3");
  menuItems.forEach(({ additionalClasslist, id, name }) => {
    const a = document.createElement("a");
    a.id = id;
    a.href = "#";
    a.innerHTML = name;
    a.classList.add("dropdown-item");
    additionalClasslist.length > 0 &&
      additionalClasslist.forEach((cls) => {
        a.classList.add(cls);
      });
  });
};
