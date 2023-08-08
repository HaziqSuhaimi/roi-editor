(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Box = require("./src/Box");
const Line = require("./src/Line");
const Workspace = require("./src/Workspace");
const { getCursorPosition } = require("./src/utils");

let resizeCoof = 1;
let imgDimension = {};
let activeTool = null;
let selectedElem = null;
const boxes = [];
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
        `${mousePos.x},${mousePos.y}`,
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

},{"./src/Box":2,"./src/Line":3,"./src/Workspace":4,"./src/utils":7}],2:[function(require,module,exports){
class Box {
  constructor(
    canvas,
    { x1, y1, x2, y2, p1, p2, p3, p4 },
    { label } = { label: "" }
  ) {
    this.p1 = {
      name: "p1",
      x: x1 || p1.x,
      y: y1 || p1.y,
      isHover: false,
      isGrab: false,
    };
    this.p2 = {
      name: "p2",
      x: x2 || p2.x,
      y: y1 || p2.y,
      isHover: false,
      isGrab: false,
    };
    this.p3 = {
      name: "p3",
      x: x2 || p3.x,
      y: y2 || p3.y,
      isHover: false,
      isGrab: false,
    };
    this.p4 = {
      name: "p4",
      x: x1 || p4.x,
      y: y2 || p4.y,
      isHover: false,
      isGrab: false,
    };
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.strokeStyle = "lightgreen";
    this.fillStyle = "green";
    this.isHover = false;
    this.type = "box";
    this.isGrab = false;
    this.id = this.#generateClientId();
    this.isActive = false;
    this.label = { value: label };
    this.bbox = {
      tl: { x: this.p1.x, y: this.p1.y },
      br: { x: this.p3.x, y: this.p3.y },
      midp: {
        x: this.p1.x + Math.abs(this.p1.x - this.p3.x) / 2,
        y: this.p1.y + Math.abs(this.p1.y - this.p3.y) / 2,
      },
    };
  }

  #generateClientId() {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(16);
  }

  #drawLinePoint({ x, y, isGrab }, { color, size } = {}) {
    this.ctx.fillStyle = isGrab ? "red" : color || this.fillStyle;
    const s = size || 5;
    this.ctx.beginPath();
    this.ctx.fillRect(x - s, y - s, s * 2, s * 2);
    this.ctx.closePath();
  }

  #checkMouseHover({ x, y, state, isDown }, isDrawMode = false) {
    if (isDrawMode && !this.isActive) {
      [this.p1, this.p2, this.p3, this.p4].forEach((p, i) => {
        if (p.isGrab && isDown) {
          p.x = x;
          p.y = y;
        } else {
          p.isGrab = false;
        }
        if (this.isGrab) return;
        if (
          x >= Math.abs(p.x - 5) &&
          x <= Math.abs(p.x + 5) &&
          y >= Math.abs(p.y - 5) &&
          y <= Math.abs(p.y + 5)
        ) {
          p.isHover = true;
          this.#drawLinePoint(p);
          if (isDown) {
            p.isGrab = true;
            p.x = x;
            p.y = y;
            this.canvas.dispatchEvent(new CustomEvent("pointGrab"));
          }
          if (state === "rightClick") {
            this.canvas.dispatchEvent(
              new CustomEvent("openMenu", {
                detail: {
                  top: y,
                  left: this.canvas.offsetLeft + x,
                  ownerData: { ...this },
                },
              })
            );
          }
        } else {
          p.isHover = false;
          p.isGrab = false;
          this.ctx.fillStyle = this.fillStyle;
          this.#drawLinePoint(p);
        }
      });

      this.isHover =
        this.p1.isHover ||
        this.p2.isHover ||
        this.p3.isHover ||
        this.p4.isHover;

      this.isGrab =
        this.p1.isGrab || this.p2.isGrab || this.p3.isGrab || this.p4.isGrab;
    }
  }

  #calculateBoundingBox() {
    this.bbox.tl = {
      x: Math.min(this.p1.x, this.p2.x, this.p3.x, this.p4.x),
      y: Math.min(this.p1.y, this.p2.y, this.p3.y, this.p4.y),
    };
    this.bbox.br = {
      x: Math.max(this.p1.x, this.p2.x, this.p3.x, this.p4.x),
      y: Math.max(this.p1.y, this.p2.y, this.p3.y, this.p4.y),
    };

    this.bbox.midp = {
      x: this.bbox.tl.x + Math.abs(this.bbox.tl.x - this.bbox.br.x) / 2,
      y: this.bbox.tl.y + Math.abs(this.bbox.tl.y - this.bbox.br.y) / 2,
    };
  }

  #checkMouseHoverElement({ x, y, state, isDown }) {
    if (this.isActive) {
      this.ctx.strokeStyle = "lightblue";
      this.ctx.lineWidth = 2;
      this.#drawLinePoint(this.bbox.midp, { color: "lightblue", size: 2 });
      this.ctx.setLineDash([15, 15]);
      this.ctx.strokeRect(
        this.bbox.tl.x - 8,
        this.bbox.tl.y - 8,
        this.bbox.br.x - this.bbox.tl.x + 16,
        this.bbox.br.y - this.bbox.tl.y + 16
      );
    }
    if (
      x > this.bbox.tl.x &&
      x < this.bbox.br.x &&
      y > this.bbox.tl.y &&
      y < this.bbox.br.y
    ) {
      if (state === "rightClick") {
        this.canvas.dispatchEvent(
          new CustomEvent("openMenu", {
            detail: {
              top: y,
              left: this.canvas.offsetLeft + x,
              ownerData: { ...this },
            },
          })
        );
      }
      if (isDown && this.isActive) {
        if (state === "mousemove" || state === "mousedown") {
          this.#setMove({ x, y });
        }
      }
      if (this.isActive) {
        this.canvas.style.cursor = "move";
      }
    } else {
      if (this.isActive) {
        this.canvas.style.cursor = "default";
      }
    }
  }

  setSelected(isActive) {
    this.isActive = isActive;
  }

  #setMove({ x, y }) {
    this.p1.x = x + (this.p1.x - this.bbox.midp.x);
    this.p1.y = y + (this.p1.y - this.bbox.midp.y);
    this.p2.x = x + (this.p2.x - this.bbox.midp.x);
    this.p2.y = y + (this.p2.y - this.bbox.midp.y);
    this.p3.x = x + (this.p3.x - this.bbox.midp.x);
    this.p3.y = y + (this.p3.y - this.bbox.midp.y);
    this.p4.x = x + (this.p4.x - this.bbox.midp.x);
    this.p4.y = y + (this.p4.y - this.bbox.midp.y);
  }

  draw(mouse, isDrawMode) {
    this.#calculateBoundingBox();
    this.ctx.strokeStyle = this.strokeStyle;
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.p1.x, this.p1.y);
    this.ctx.lineTo(this.p2.x, this.p2.y);
    this.ctx.lineTo(this.p3.x, this.p3.y);
    this.ctx.lineTo(this.p4.x, this.p4.y);
    this.ctx.closePath();
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.stroke();
    this.#drawLinePoint(this.p1);
    this.#drawLinePoint(this.p2);
    this.#drawLinePoint(this.p3);
    this.#drawLinePoint(this.p4);
    if (mouse !== undefined) {
      this.#checkMouseHover(mouse, isDrawMode);
      this.#checkMouseHoverElement(mouse);
    }
    this.ctx.font = "20px sans-serif";
    this.ctx.strokeText(this.label.value, this.p1.x + 5, this.p1.y + 20);
    this.ctx.font = "10px sans-serif";
  }
}

module.exports = Box;

},{}],3:[function(require,module,exports){
class Line {
  constructor(canvas, { x1, y1, x2, y2 }) {
    this.p1 = { name: "p1", x: x1, y: y1, isHover: false, isGrab: false };
    this.p2 = { name: "p2", x: x2, y: y2, isHover: false, isGrab: false };
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.strokeStyle = "yellow";
    this.fillStyle = "goldenrod ";
    this.isHover = false;
    this.type = "line";
    this.isGrab = false;
    this.id = this.#generateClientId();
    this.isActive = false;
    this.label = { value: "" };
    this.bbox = {
      tl: { x: this.p1.x, y: this.p1.y },
      br: { x: this.p2.x, y: this.p2.y },
      midp: {
        x: this.p1.x + Math.abs(this.p1.x - this.p2.x) / 2,
        y: this.p1.y + Math.abs(this.p1.y - this.p2.y) / 2,
      },
    };
  }

  #generateClientId() {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(16);
  }

  #drawLinePoint({ x, y, isGrab }, { color, size } = {}) {
    this.ctx.fillStyle = isGrab ? "red" : color || this.fillStyle;
    const s = size || 5;
    this.ctx.beginPath();
    this.ctx.fillRect(x - s, y - s, s * 2, s * 2);
    this.ctx.closePath();
  }

  #checkMouseHover({ x, y, state, isDown }, isDrawMode = false) {
    if (isDrawMode && !this.isActive) {
      [this.p1, this.p2].forEach((p, i) => {
        if (p.isGrab && isDown) {
          p.x = x;
          p.y = y;
        } else {
          p.isGrab = false;
        }
        if (this.isGrab) return;
        if (
          x >= Math.abs(p.x - 5) &&
          x <= Math.abs(p.x + 5) &&
          y >= Math.abs(p.y - 5) &&
          y <= Math.abs(p.y + 5)
        ) {
          p.isHover = true;
          this.#drawLinePoint(p);
          if (isDown) {
            p.isGrab = true;
            p.x = x;
            p.y = y;
            this.canvas.dispatchEvent(new CustomEvent("pointGrab"));
          }
          if (state === "rightClick") {
            this.canvas.dispatchEvent(
              new CustomEvent("openMenu", {
                detail: {
                  top: y,
                  left: this.canvas.offsetLeft + x,
                  ownerData: { ...this },
                },
              })
            );
          }
        } else {
          p.isHover = false;
          p.isGrab = false;
          this.ctx.fillStyle = this.fillStyle;
          this.#drawLinePoint(p);
        }
      });

      this.isHover = this.p1.isHover || this.p2.isHover;

      this.isGrab = this.p1.isGrab || this.p2.isGrab;
    }
  }

  #calculateBoundingBox() {
    this.bbox.tl = {
      x: Math.min(this.p1.x, this.p2.x),
      y: Math.min(this.p1.y, this.p2.y),
    };
    this.bbox.br = {
      x: Math.max(this.p1.x, this.p2.x),
      y: Math.max(this.p1.y, this.p2.y),
    };

    this.bbox.midp = {
      x: this.bbox.tl.x + Math.abs(this.bbox.tl.x - this.bbox.br.x) / 2,
      y: this.bbox.tl.y + Math.abs(this.bbox.tl.y - this.bbox.br.y) / 2,
    };
  }

  #setMove({ x, y }) {
    this.p1.x = x + (this.p1.x - this.bbox.midp.x);
    this.p1.y = y + (this.p1.y - this.bbox.midp.y);
    this.p2.x = x + (this.p2.x - this.bbox.midp.x);
    this.p2.y = y + (this.p2.y - this.bbox.midp.y);
  }

  setSelected(isActive) {
    this.isActive = isActive;
  }

  #checkMouseHoverElement({ x, y, state, isDown }) {
    if (this.isActive) {
      this.ctx.strokeStyle = "lightblue";
      this.ctx.lineWidth = 2;
      this.#drawLinePoint(this.bbox.midp, { color: "lightblue", size: 2 });
      this.ctx.setLineDash([15, 15]);
      this.ctx.strokeRect(
        this.bbox.tl.x - 8,
        this.bbox.tl.y - 8,
        this.bbox.br.x - this.bbox.tl.x + 16,
        this.bbox.br.y - this.bbox.tl.y + 16
      );
    }
    if (
      x > this.bbox.tl.x &&
      x < this.bbox.br.x &&
      y > this.bbox.tl.y &&
      y < this.bbox.br.y
    ) {
      if (state === "rightClick") {
        this.canvas.dispatchEvent(
          new CustomEvent("openMenu", {
            detail: {
              top: y,
              left: this.canvas.offsetLeft + x,
              ownerData: { ...this },
            },
          })
        );
      }
      if (isDown && this.isActive) {
        if (state === "mousemove" || state === "mousedown") {
          this.#setMove({ x, y });
        }
      }
      if (this.isActive) {
        this.canvas.style.cursor = "move";
      }
    } else {
      if (this.isActive) {
        this.canvas.style.cursor = "default";
      }
    }
  }

  draw(mouse, isDrawMode) {
    this.#calculateBoundingBox();
    this.ctx.strokeStyle = this.strokeStyle;
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.p1.x, this.p1.y);
    this.ctx.lineTo(this.p2.x, this.p2.y);
    this.ctx.closePath();
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.stroke();
    this.#drawLinePoint(this.p1);
    this.#drawLinePoint(this.p2);
    if (mouse !== undefined) {
      this.#checkMouseHover(mouse, isDrawMode);
      this.#checkMouseHoverElement(mouse);
    }
    this.ctx.font = "20px sans-serif";
    this.ctx.strokeText(this.label.value, this.p1.x + 5, this.p1.y + 20);
    this.ctx.font = "10px sans-serif";
  }
}

module.exports = Line;

},{}],4:[function(require,module,exports){
const {
  renderDrawCanvas,
  renderImgCanvas,
  renderMenu,
  renderLabelInput,
  renderToolbar,
} = require("./components");

const Workspace = (editor, onImgLoaded = () => {}) => {
  try {
    let resizeCoof = 1;
    editor.classList.add(
      "d-flex",
      "justify-content-center",
      "align-items-center",
      "flex-column",
      "position-relative"
    );
    const drawCanvas = renderDrawCanvas(editor);
    const imgCanvas = renderImgCanvas();
    const { menu, menuItemBtns } = renderMenu(editor);
    const { menuLabel, menuLabelInput } = renderLabelInput(editor);
    const { toolbar, toolbarBtns, menuLabelBtns, settingDrawer } =
      renderToolbar(editor);

    editor.appendChild(imgCanvas);
    editor.appendChild(drawCanvas);
    editor.appendChild(menu);
    editor.appendChild(menuLabel);
    editor.appendChild(toolbar);

    const baseImage = new Image();
    baseImage.src = editor.dataset.imgSrc;
    baseImage.onload = () => {
      resizeCoof = editor.clientWidth / baseImage.width;
      imgCanvas.width = editor.clientWidth;
      imgCanvas.height = baseImage.height * resizeCoof;
      drawCanvas.width = imgCanvas.width;
      drawCanvas.height = imgCanvas.height;
      imgCanvas
        .getContext("2d")
        .drawImage(baseImage, 0, 0, imgCanvas.width, imgCanvas.height);

      settingDrawer.style.width = `${imgCanvas.width}px`;
      settingDrawer.style.height = 0;
      settingDrawer.isOpen = false;

      onImgLoaded({
        resizeCoof,
        imgDimension: {
          original: { width: baseImage.width, height: baseImage.height },
          applied: { width: imgCanvas.width, height: imgCanvas.height },
        },
      });
    };
    return {
      drawCanvas,
      menu,
      toolbarBtns,
      menuLabel,
      menuItemBtns,
      menuLabelInput,
      menuLabelBtns,
      settingDrawer,
    };
  } catch (e) {
    confirm(e);
  }
};

module.exports = Workspace;

},{"./components":5}],5:[function(require,module,exports){
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

},{"./icons":6}],6:[function(require,module,exports){
const x = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`;

const check = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
</svg>`;

const reset = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
</svg>`;

const done = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16" >
    <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
    <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
</svg>`;

const cog = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16" >
    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
</svg>`;

module.exports = {
  x,
  check,
  reset,
  done,
  cog,
};

},{}],7:[function(require,module,exports){
const getCursorPosition = (mousePos, canvas, event, state) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  mousePos = { ...mousePos, x, y, state };
  return mousePos
};

module.exports = { getCursorPosition };

},{}]},{},[1]);
