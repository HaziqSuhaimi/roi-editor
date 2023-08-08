const { x, check, reset, done, cog } = require("./icons");

const renderDrawCanvas = (edWrapper) => {
  const drawCanvas = document.createElement("canvas");
  drawCanvas.id = "canvas2";
  drawCanvas.classList.add("position-absolute", "top-0", "z-2");
  drawCanvas.addEventListener("mousedown", (evt) => {
    edWrapper.dispatchEvent(
      new CustomEvent("draw-canvas", {
        detail: { evt, id: drawCanvas.id, event: "mousedown" },
      })
    );
  });
  drawCanvas.addEventListener("contextmenu", (evt) => {
    edWrapper.dispatchEvent(
      new CustomEvent("draw-canvas", {
        detail: { evt, id: drawCanvas.id, event: "contextmenu" },
      })
    );
  });
  drawCanvas.addEventListener("mouseup", (evt) => {
    edWrapper.dispatchEvent(
      new CustomEvent("draw-canvas", {
        detail: { evt, id: drawCanvas.id, event: "mouseup" },
      })
    );
  });
  drawCanvas.addEventListener("mousemove", (evt) => {
    edWrapper.dispatchEvent(
      new CustomEvent("draw-canvas", {
        detail: { evt, id: drawCanvas.id, event: "mousemove" },
      })
    );
  });
  drawCanvas.addEventListener("mouseenter", (evt) => {
    edWrapper.dispatchEvent(
      new CustomEvent("draw-canvas", {
        detail: { evt, id: drawCanvas.id, event: "mouseenter" },
      })
    );
  });
  window.addEventListener("click", (evt) => {
    if (evt.target.contains(drawCanvas) && evt.target !== drawCanvas) {
      edWrapper.dispatchEvent(
        new CustomEvent("draw-canvas", {
          detail: { evt, id: drawCanvas.id, event: "clickoutside" },
        })
      );
    }
  });
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

const renderMenu = (edWrapper) => {
  const menu = document.createElement("div");
  const menuItemBtns = [];
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
    a.addEventListener("click", (evt) => {
      edWrapper.dispatchEvent(
        new CustomEvent("menu-items-click", {
          detail: { evt, id, event: "click" },
        })
      );
    });
    menu.appendChild(a);
    menuItemBtns.push(a);
  });
  return { menu, menuItemBtns };
};

const renderLabelInput = (edWrapper) => {
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
  cancelBtn.addEventListener("click", (evt) => {
    edWrapper.dispatchEvent(
      new CustomEvent("menu-label-btn-click", {
        detail: { evt, id: cancelBtn.id, event: "cancel" },
      })
    );
  });
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
  doneBtn.addEventListener("click", (evt) => {
    edWrapper.dispatchEvent(
      new CustomEvent("menu-label-btn-click", {
        detail: { evt, id: doneBtn.id, event: "done" },
      })
    );
  });
  menuInputGroup.appendChild(doneBtn);
  return {
    menuLabel: menu,
    menuLabelInput: input,
  };
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
        innerHTML: "Box",
        style: "",
      },
      {
        title: "Draw line",
        id: "editor-btn-line",
        type: "button",
        class: ["btn", "btn-outline-primary"],
        innerHTML: "Line",
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
        innerHTML: reset,
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
        innerHTML: done,
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
        innerHTML: cog,
      },
    ],
  },
];

const renderToolbar = (edWrapper) => {
  const toolbar = document.createElement("div");
  const toolbarBtns = [];
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
      btn.addEventListener("click", (evt) => {
        edWrapper.dispatchEvent(
          new CustomEvent("toolbar-btn-click", {
            detail: { evt, id: props.id, event: "click" },
          })
        );
      });
      wrapper.appendChild(btn);
      toolbarBtns.push(btn);
    });
    toolbar.appendChild(wrapper);
  });
  const settingDrawer =
    document.getElementById("sidebar-drawer") || document.createElement("div");
  settingDrawer.id = "sidebar-drawer";
  settingDrawer.classList.add(
    "overflow-hidden",
    "bg-light",
    "border-primary",
    "border-bottom",
    "position-absolute",
    "bottom-100"
  );
  settingDrawer.style.transition = "all 0.5s ease";
  toolbar.appendChild(settingDrawer);
  return { toolbar, toolbarBtns, settingDrawer };
};

module.exports = {
  renderDrawCanvas,
  renderImgCanvas,
  renderMenu,
  renderLabelInput,
  renderToolbar,
};
