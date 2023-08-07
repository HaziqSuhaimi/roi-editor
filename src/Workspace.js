const renderDrawCanvas = () => {
  const drawCanvas = document.createElement("canvas");
  drawCanvas.id = "canvas2";
  drawCanvas.classList.add("position-absolute", "top-0", "z-2");
  return drawCanvas;
};

const renderImgCanvas = () => {
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
    menu.appendChild(a);
  });
  return menu;
};

const renderLabelInput = () => {
  const menu = document.createElement("div");
  menu.id = "menu-label-input";
  menu.classList.add("dropdown-menu", "position-absolute", "z-3", "p-2");
  const menuContainer = document.createElement("div");
  menuContainer.classList.add("dropdown-header", "p-0");
  menu.appendChild(menuContainer);
  const menuInputGroup = document.createElement("div");
  menuInputGroup.classList.add(
    "input-group",
    "input-group-sm",
    "border",
    "rounded"
  );
  menuContainer.appendChild(menuInputGroup);
  const input = document.createElement("input");
  input.id = "menu-label-input-input";
  input.type = "text";
  input.placeholder = "Label";
  input.ariaLabel = "label";
  input.classList.add("form-control", "border-0");
  menuInputGroup.appendChild(input);
  const cancelBtn = document.createElement("button");
  cancelBtn.id = "menu-label-input-cancel";
  cancelBtn.type = "button";
  cancelBtn.classList.add("btn", "btn-outline-danger", "border-0");
  cancelBtn.innerHTML = x;
  menuInputGroup.appendChild(cancelBtn);
  const doneBtn = document.createElement("button");
  doneBtn.id = "menu-label-input-done";
  doneBtn.type = "button";
  doneBtn.classList.add(
    "btn",
    "btn-outline-success",
    "border-0",
    "rounded-end"
  );
  doneBtn.innerHTML = check;
  menuInputGroup.appendChild(doneBtn);
  return menu;
};

const toolBtnGroups = [
  {
    ariaLabel: "editor-tool",
    buttons: [
      {
        title: "Draw box",
        id: "editor-btn-box",
        type: "button",
        class: ["btn", "btn-outline-primary"],
        innerHtml: "Box",
        style: "",
      },
      {
        title: "Draw line",
        id: "editor-btn-line",
        type: "button",
        class: ["btn", "btn-outline-primary", "disabled"],
        innerHtml: "Line",
        style: "",
      },
    ],
  },
  {
    ariaLabel: "second group",
    buttons: [
      {
        title: "Reset",
        id: "editor-btn-clear",
        type: "button",
        class: ["btn", "btn-outline-danger", "rounded-circle", "p-0", "pb-1"],
        style: "height: 40px; width: 40px",
        innerHtml: reset,
      },
    ],
  },
  {
    ariaLabel: "third group",
    buttons: [
      {
        title: "Done",
        id: "editor-btn-save",
        type: "button",
        class: ["btn", "btn-outline-success", "rounded-circle", "p-0", "pb-1"],
        style: "height: 40px; width: 40px",
        innerHtml: done,
      },
    ],
  },
  {
    ariaLabel: "forth group",
    buttons: [
      {
        title: "Settings",
        id: "open-setting-btn",
        class: [
          "btn",
          "btn-outline-dark",
          "p-0",
          "pb-1",
          "m-3",
          "rounded-circle",
        ],
        type: "button",
        style: "width: 40px; height: 40px; transition: all 0.5s ease",
        innerHtml: cog,
      },
    ],
  },
];

const renderToolbar = () => {
  const toolbar = document.createElement("div");
  toolbar.classList.add(
    "position-relative",
    "btn-toolbar",
    "d-flex",
    "align-items-center",
    "justify-content-center"
  );
  toolbar.role = "toolbar";
  toolbar.ariaLabel = "Toolbar with button groups";
  toolBtnGroups.forEach(({ ariaLabel, buttons }) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("btn-group", "m-1");
    wrapper.role = "group";
    wrapper.ariaLabel = ariaLabel;
    buttons.forEach(({ class: classList, ...props }) => {
      const btn = document.createElement("button");
      Object.entries(props).forEach(([k, v]) => {
        btn[k] = v;
      });
      classList.length > 0 &&
        classList.forEach((cls) => {
          btn.classList.add(cls);
        });
      wrapper.appendChild(btn);
    });
    toolbar.appendChild(wrapper);
  });
  return toolbar;
};

const init = () => {
  try {
    const editor = document.getElementById("editor-container");
    editor.classList.add(
      "d-flex",
      "justify-content-center",
      "align-items-center",
      "flex-column",
      "position-relative"
    );
    
  } catch (e) {
    prompt(e);
  }
};

module.export = init;
