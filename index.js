const Box = require("./src/Box");
const Line = require("./src/Line");
const Workspace = require("./src/Workspace");
const { getCursorPosition } = require("./src/utils");

let resizeCoof = 1;
let imgDimension = {};
let activeTool = null;
let selectedElem = null;
const boxes = window.localStorage.getItem("PREBOXES") || [];
const lines = [];
let visualizerBox = null;
let mousePos = { x: 0, y: 0, state: null, isDown: false };

const editor = document.getElementById("editor-container");
const {
  drawCanvas,
  menu,
  toolbarBtns,
  menuLabel,
  menuItemBtns,
  menuLabelInput,
  settingDrawer,
} = Workspace(editor, ({ resizeCoof: coof, imgDimension: iDim }) => {
  resizeCoof = coof;
  imgDimension = iDim;
});
const [btnBox, btnLine, _btnClear, _btnDone, openSettingBtn] = toolbarBtns;
const [_moveBtn, _labelBtn, lockBtn, _deleteBtn] = menuItemBtns;
const drawCanvasCtx = drawCanvas.getContext("2d");

const redraw = () => {
  drawCanvasCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  boxes.forEach((box) => {
    box.draw(mousePos, activeTool);
  });

  lines.forEach((line) => {
    line.draw(mousePos, activeTool);
  });

  if (!selectedElem) {
    if (mousePos.isDown && visualizerBox === null) {
      visualizerBox = { x: mousePos.x, y: mousePos.y };
    }
    if (mousePos.state === "mousemove" && mousePos.isDown) {
      if (activeTool === "box") {
        drawCanvasCtx.beginPath();
        drawCanvasCtx.strokeStyle = "tomato";
        drawCanvasCtx.rect(
          visualizerBox.x,
          visualizerBox.y,
          mousePos.x - visualizerBox.x,
          mousePos.y - visualizerBox.y
        );
        drawCanvasCtx.stroke();
      }

      if (activeTool === "line") {
        drawCanvasCtx.beginPath();
        drawCanvasCtx.strokeStyle = "orange";
        drawCanvasCtx.moveTo(visualizerBox.x, visualizerBox.y);
        drawCanvasCtx.lineTo(mousePos.x, mousePos.y);
        drawCanvasCtx.stroke();
      }
    }
    if (!mousePos.isDown) {
      if (visualizerBox) {
        if (activeTool === "box") {
          boxes.push(
            new Box(drawCanvas, {
              x1: visualizerBox.x,
              y1: visualizerBox.y,
              x2: mousePos.x,
              y2: mousePos.y,
            })
          );
        }
        if (activeTool === "line") {
          lines.push(
            new Line(drawCanvas, {
              x1: visualizerBox.x,
              y1: visualizerBox.y,
              x2: mousePos.x,
              y2: mousePos.y,
            })
          );
        }
      }
      visualizerBox = null;
    }
  }

  if (!selectedElem) {
    drawCanvas.style.cursor =
      activeTool === "box" || activeTool === "line"
        ? "crosshair"
        : activeTool === "edit"
        ? boxes.findIndex(({ isGrab }) => isGrab) >= 0 ||
          lines.findIndex(({ isGrab }) => isGrab) >= 0
          ? "grabbing"
          : "grab"
        : "default";

    if (activeTool === "box" || activeTool === "line") {
      drawCanvasCtx.lineWidth = 0.5;
      drawCanvasCtx.strokeStyle = "grey";
      drawCanvasCtx.fillStyle = "grey";
      drawCanvasCtx.setLineDash([5, 1]);
      drawCanvasCtx.beginPath();
      drawCanvasCtx.moveTo(0, mousePos.y);
      drawCanvasCtx.lineTo(drawCanvas.width, mousePos.y);
      drawCanvasCtx.stroke();
      drawCanvasCtx.beginPath();
      drawCanvasCtx.moveTo(mousePos.x, 0);
      drawCanvasCtx.lineTo(mousePos.x, drawCanvas.height);
      drawCanvasCtx.stroke();
      drawCanvasCtx.fillText(
        `${+mousePos.x.toFixed(2)},${+mousePos.y.toFixed(2)}`,
        mousePos.x + 5,
        mousePos.y - 5
      );
    }
  }
  window.requestAnimationFrame(redraw);
};

editor.addEventListener("toolbar-btn-click", ({ detail }) => {
  //   console.log("toolbar-btn-click", detail.id);
  switch (detail.id) {
    case "editor-btn-box":
      activeTool = "box";
      btnBox.classList.add("active");
      btnLine.classList.remove("active");
      break;
    case "editor-btn-line":
      activeTool = "line";
      btnBox.classList.remove("active");
      btnLine.classList.add("active");
      break;
    case "editor-btn-clear":
      selectedElem = null;
      menu.classList.contains("show") && menu.classList.remove("show");
      menuLabel.classList.contains("show") &&
        menuLabel.classList.remove("show");
      lockBtn.classList.add("d-none");
      boxes.splice(0, boxes.length);
      lines.splice(0, lines.length);
      drawCanvasCtx.reset();
      break;
    case "editor-btn-save":
      editor.dispatchEvent(
        new CustomEvent("ondone", {
          detail: { resizeCoof, boxes, lines, imgDimension },
        })
      );
      break;
    case "open-setting-btn":
      if (!settingDrawer.isOpen) {
        settingDrawer.style.height = `${drawCanvas.height * 0.9}px`;
        openSettingBtn.style.transform = "rotateZ(180deg)";
      } else {
        settingDrawer.style.height = 0;
        openSettingBtn.style.transform = "rotateZ(0deg)";
      }
      settingDrawer.isOpen = !settingDrawer.isOpen;
      break;
  }
});
editor.addEventListener("menu-items-click", ({ detail }) => {
  //   console.log("menu-items-click", detail.id);
  switch (detail.id) {
    case "menu-move":
      menu.classList.contains("show") && menu.classList.remove("show");
      menuLabel.classList.contains("show") &&
        menuLabel.classList.remove("show");
      lockBtn.classList.remove("d-none");

      const element =
        boxes.find(({ id }) => id === menu.ownerData.id) ||
        lines.find(({ id }) => id === menu.ownerData.id);
      let activeElement = boxes.filter(({ isActive }) => isActive);
      activeElement = activeElement.concat(
        lines.filter(({ isActive }) => isActive)
      );

      activeElement.length > 0 &&
        activeElement.forEach((b) => b.setSelected(false));
      element && element.setSelected(true);
      selectedElem = element;
      break;
    case "menu-label":
      menuLabel.style.top = menu.style.top;
      menuLabel.style.left = menu.style.left;
      menuLabel.ownerData = menu.ownerData;
      menu.classList.contains("show") && menu.classList.remove("show");
      menuLabel.classList.add("show");
      menuLabelInput.focus();
      break;
    case "menu-delete":
      menu.classList.contains("show") && menu.classList.remove("show");
      menuLabel.classList.contains("show") &&
        menuLabel.classList.remove("show");
      const boxIdx = boxes.findIndex(({ id }) => id === menu.ownerData.id);
      if (boxIdx >= 0) {
        if (boxes[boxIdx]?.isActive) {
          selectedElem = null;
          lockBtn.classList.add("d-none");
        }
        boxes.splice(boxIdx, 1);
      }

      const lineIdx = lines.findIndex(({ id }) => id === menu.ownerData.id);
      if (lineIdx >= 0) {
        if (lines[lineIdx]?.isActive) {
          selectedElem = null;
          lockBtn.classList.add("d-none");
        }
        lines.splice(lineIdx, 1);
      }
      break;
    case "menu-lock":
      menu.classList.contains("show") && menu.classList.remove("show");
      menuLabel.classList.contains("show") &&
        menuLabel.classList.remove("show");
      boxes.forEach((b) => b.setSelected(false));
      lines.forEach((b) => b.setSelected(false));
      selectedElem = null;
      lockBtn.classList.add("d-none");
      break;
  }
});
editor.addEventListener("draw-canvas", ({ detail }) => {
  switch (detail.event) {
    case "mousedown":
      if (detail.evt.button === 0) {
        mousePos = {
          ...getCursorPosition(mousePos, drawCanvas, detail.evt, "mousedown"),
          isDown: true,
        };
      }
      if (detail.evt.button === 2) {
        mousePos = getCursorPosition(
          mousePos,
          drawCanvas,
          detail.evt,
          "rightClick"
        );
      }
      break;
    case "contextmenu":
      detail.evt.preventDefault();
      break;
    case "mouseup":
      mousePos = {
        ...getCursorPosition(mousePos, drawCanvas, detail.evt, "mouseup"),
        isDown: false,
      };
      break;
    case "mousemove":
      mousePos = getCursorPosition(
        mousePos,
        drawCanvas,
        detail.evt,
        "mousemove"
      );
      break;
    case "mouseenter":
      if (!activeTool) {
        activeTool = "edit";
      }
      break;
    case "clickoutside":
      activeTool = null;
      btnBox.classList.remove("active");
      btnLine.classList.remove("active");
      break;
  }
});
editor.addEventListener("menu-label-btn-click", ({ detail }) => {
  switch (detail.event) {
    case "cancel":
      menuLabelInput.value = "";
      menuLabel.classList.remove("show");
      break;
    case "done":
      if (menuLabelInput.value) {
        menuLabel.ownerData.label.value = menuLabelInput.value;
        menuLabel.ownerData.isActive = true;
      }
      menuLabelInput.value = "";
      menuLabel.classList.remove("show");
      break;
  }
});
editor.addEventListener("ondone", ({ detail }) => {
  console.log("ondone", detail);
});

drawCanvas.addEventListener("pointGrab", () => {
  activeTool = "edit";
  btnBox.classList.remove("active");
  btnLine.classList.remove("active");
});
drawCanvas.addEventListener("openMenu", ({ detail }) => {
  menu.classList.add("show");
  menu.style.top = `${detail.top}px`;
  menu.style.left = `${detail.left}px`;
  menu.ownerData = detail.ownerData;
});
drawCanvas.addEventListener("elementMove", () => {
  activeTool = "move";
  btnBox.classList.remove("active");
  btnLine.classList.remove("active");
});

window.addEventListener("click", (event) => {
  if (
    event.target.contains(openSettingBtn) &&
    event.target !== openSettingBtn
  ) {
    settingDrawer.isOpen && openSettingBtn.click();
  }
});

window.requestAnimationFrame(redraw);

window.ROI_EDITOR = { Box, Line, resizeCoof };
