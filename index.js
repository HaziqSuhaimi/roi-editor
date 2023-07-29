const canvas = document.getElementById("editor");
const menu = document.getElementById("menu");
const menuLabel = document.getElementById("menu-label-input");
const menuLabelInput = document.getElementById("menu-label-input-input");
const menuLabelCancel = document.getElementById("menu-label-input-cancel");
const menuLabelDone = document.getElementById("menu-label-input-done");
const deleteBtn = document.getElementById("menu-delete");
const moveBtn = document.getElementById("menu-move");
const labelBtn = document.getElementById("menu-label");
const lockBtn = document.getElementById("menu-lock");
const canvas2 = document.getElementById("canvas2");
const btnBox = document.getElementById("editor-btn-box");
const btnLine = document.getElementById("editor-btn-line");
const btnClear = document.getElementById("editor-btn-clear");
const btnDone = document.getElementById("editor-btn-save");
const editor = canvas.getContext("2d");
const editor2 = canvas2.getContext("2d");
const sideDrawer = document.getElementById("sidebar-drawer");
const openSettingBtn = document.getElementById("open-setting-btn");
const formElements = {
  videoStream: document.getElementById("videoStream"),
  enterBuffer: document.getElementById("enterBuffer"),
  exitTimeout: document.getElementById("exitTimeout"),
  triggerArea: document.getElementById("triggerArea"),
  skipFrame: document.getElementById("skipFrame"),
  waitTime: document.getElementById("waitTime"),
};

let activeTool = null;
let selectedElem = null;
let resizeCoof = 1;
const boxes = [];
const lines = [];
let visualizerBox = null;
let mousePos = { x: 0, y: 0, state: null, isDown: false };

const generateClientId = () => {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
};


const redraw = () => {
  editor2.clearRect(0, 0, canvas2.width, canvas2.height);
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
        editor2.beginPath();
        editor2.strokeStyle = "tomato";
        editor2.rect(
          visualizerBox.x,
          visualizerBox.y,
          mousePos.x - visualizerBox.x,
          mousePos.y - visualizerBox.y
        );
        editor2.stroke();
      }

      if (activeTool === "line") {
        editor2.beginPath();
        editor2.strokeStyle = "orange";
        editor2.moveTo(visualizerBox.x, visualizerBox.y);
        editor2.lineTo(mousePos.x, mousePos.y);
        editor2.stroke();
      }
    }
    if (!mousePos.isDown) {
      if (visualizerBox) {
        if (activeTool === "box") {
          boxes.push(
            new Box(canvas2, {
              x1: visualizerBox.x,
              y1: visualizerBox.y,
              x2: mousePos.x,
              y2: mousePos.y,
            })
          );
        }
        if (activeTool === "line") {
          lines.push(
            new Line(canvas2, {
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
    canvas2.style.cursor =
      activeTool === "box" || activeTool === "line"
        ? "crosshair"
        : activeTool === "edit"
        ? boxes.findIndex(({ isGrab }) => isGrab) >= 0 ||
          lines.findIndex(({ isGrab }) => isGrab) >= 0
          ? "grabbing"
          : "grab"
        : "default";

    if (activeTool === "box" || activeTool === "line") {
      editor2.lineWidth = 0.5;
      editor2.strokeStyle = "grey";
      editor2.fillStyle = "grey";
      editor2.setLineDash([5, 1]);
      editor2.beginPath();
      editor2.moveTo(0, mousePos.y);
      editor2.lineTo(canvas2.width, mousePos.y);
      editor2.stroke();
      editor2.beginPath();
      editor2.moveTo(mousePos.x, 0);
      editor2.lineTo(mousePos.x, canvas2.height);
      editor2.stroke();
      editor2.fillText(
        `${mousePos.x},${mousePos.y}`,
        mousePos.x + 5,
        mousePos.y - 5
      );
    }
  }
  window.requestAnimationFrame(redraw);
};

const initRepopulateRoi = () => {
  fetch("/private/settings.json")
    .then((d) => d.json())
    .then((setting) => {
      // console.log(data);
      // const roi = { "Pump 1": "368, 178, 589, 178, 368, 419, 589, 419" };
      Object.entries(setting.roi).forEach(([label, coord]) => {
        const [p1x, p1y, p2x, p2y, p4x, p4y, p3x, p3y] = coord.split(", ");
        boxes.push(
          new Box(
            canvas2,
            {
              p1: { x: p1x * resizeCoof, y: p1y * resizeCoof },
              p2: { x: p2x * resizeCoof, y: p2y * resizeCoof },
              p3: { x: p3x * resizeCoof, y: p3y * resizeCoof },
              p4: { x: p4x * resizeCoof, y: p4y * resizeCoof },
            },
            { label }
          )
        );
      });
      Object.entries(formElements).forEach(([k, el]) => {
        el.value = setting[k];
      });
    });
};

const initializeImg = () => {
  const baseImage = new Image();
  const frame = window.localStorage.getItem("frame");
  baseImage.src = frame ? `data:image/jpeg;base64,${frame}` : "/test/test.avif";
  baseImage.onload = () => {
    canvas.width =
      document.body.clientWidth > 1080
        ? document.body.clientWidth / 2
        : document.body.clientWidth;
    resizeCoof = canvas.width / baseImage.width;
    canvas.height = baseImage.height * resizeCoof;
    canvas2.width = canvas.width;
    canvas2.height = canvas.height;
    editor.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    initRepopulateRoi();

    sideDrawer.style.width = `${canvas.width}px`;
    sideDrawer.style.height = 0;
    sideDrawer.isOpen = false;
  };
};

canvas2.addEventListener("pointGrab", function () {
  activeTool = "edit";
  btnBox.classList.remove("active");
  btnLine.classList.remove("active");
});
canvas2.addEventListener("openMenu", function ({ detail }) {
  menu.classList.add("show");
  menu.style.top = `${detail.top}px`;
  menu.style.left = `${detail.left}px`;
  menu.ownerData = detail.ownerData;
});
canvas2.addEventListener("elementMove", function () {
  activeTool = "move";
  btnBox.classList.remove("active");
  btnLine.classList.remove("active");
});
// window.addEventListener("resize", () => {
//   initializeImg();
// });
window.addEventListener("load", () => {
  initializeImg();
});
btnBox.addEventListener("click", () => {
  activeTool = "box";
  btnBox.classList.add("active");
  btnLine.classList.remove("active");
});
btnLine.addEventListener("click", () => {
  activeTool = "line";
  btnBox.classList.remove("active");
  btnLine.classList.add("active");
});
window.addEventListener("click", (event) => {
  if (event.target.contains(canvas) && event.target !== canvas) {
    activeTool = null;
    btnBox.classList.remove("active");
    btnLine.classList.remove("active");
  }
  if (
    event.target.contains(openSettingBtn) &&
    event.target !== openSettingBtn
  ) {
    sideDrawer.isOpen && openSettingBtn.click();
  }
});
const getCursorPosition = (canvas, event, state) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  mousePos = { ...mousePos, x, y, state };
};
canvas2.addEventListener("mousedown", function (e) {
  if (menu.classList.contains("show")) return menu.classList.remove("show");
  // if (menuLabel.classList.contains("show")) return menuLabel.classList.remove("show");
  if (e.button === 0) {
    getCursorPosition(canvas2, e, "mousedown");
    mousePos = { ...mousePos, isDown: true };
  }
  if (e.button === 2) {
    getCursorPosition(canvas2, e, "rightClick");
  }
});
canvas2.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
canvas2.addEventListener("mouseup", function (e) {
  getCursorPosition(canvas2, e, "mouseup");
  mousePos = { ...mousePos, isDown: false };
});
canvas2.addEventListener("mousemove", function (e) {
  getCursorPosition(canvas2, e, "mousemove");
});
canvas2.addEventListener("mouseenter", function () {
  if (!activeTool) {
    activeTool = "edit";
  }
});
deleteBtn.addEventListener("click", function () {
  menu.classList.contains("show") && menu.classList.remove("show");
  menuLabel.classList.contains("show") && menuLabel.classList.remove("show");
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
});
moveBtn.addEventListener("click", function () {
  menu.classList.contains("show") && menu.classList.remove("show");
  menuLabel.classList.contains("show") && menuLabel.classList.remove("show");
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
});
lockBtn.addEventListener("click", function () {
  menu.classList.contains("show") && menu.classList.remove("show");
  menuLabel.classList.contains("show") && menuLabel.classList.remove("show");
  boxes.forEach((b) => b.setSelected(false));
  lines.forEach((b) => b.setSelected(false));
  selectedElem = null;
  lockBtn.classList.add("d-none");
});
btnClear.addEventListener("click", function () {
  menu.classList.contains("show") && menu.classList.remove("show");
  menuLabel.classList.contains("show") && menuLabel.classList.remove("show");
  selectedElem = null;
  lockBtn.classList.add("d-none");
  boxes.splice(0, boxes.length);
  lines.splice(0, lines.length);
  editor2.reset();
});
btnDone.addEventListener("click", function () {
  menu.classList.contains("show") && menu.classList.remove("show");
  menuLabel.classList.contains("show") && menuLabel.classList.remove("show");
  const roi = {};
  boxes.forEach(({ label, p1, p2, p3, p4 }, key) => {
    roi[label.value || `Pump ${key + 1}`] = `${Number(
      p1.x / resizeCoof
    ).toFixed(0)}, ${Number(p1.y / resizeCoof).toFixed(0)}, ${Number(
      p2.x / resizeCoof
    ).toFixed(0)}, ${Number(p2.y / resizeCoof).toFixed(0)}, ${Number(
      p4.x / resizeCoof
    ).toFixed(0)}, ${Number(p4.y / resizeCoof).toFixed(0)}, ${Number(
      p3.x / resizeCoof
    ).toFixed(0)}, ${Number(p3.y / resizeCoof).toFixed(0)}`;
  });

  fetch("/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roi,
      enterBuffer: +formElements.enterBuffer.value,
      exitTimeout: +formElements.exitTimeout.value,
      triggerArea: +formElements.triggerArea.value,
      skipFrame: +formElements.skipFrame.value,
      waitTime: +formElements.waitTime.value,
      videoStream: formElements.videoStream.value,
    }),
  })
    .then((d) => d.json())
    .finally(() => {
      window.location.href = "/";
    });
});
labelBtn.addEventListener("click", function () {
  menuLabel.style.top = menu.style.top;
  menuLabel.style.left = menu.style.left;
  menuLabel.ownerData = menu.ownerData;
  menu.classList.contains("show") && menu.classList.remove("show");
  menuLabel.classList.add("show");
  menuLabelInput.focus();
});
menuLabelCancel.addEventListener("click", function () {
  menuLabelInput.value = "";
  menuLabel.classList.remove("show");
});
menuLabelDone.addEventListener("click", function () {
  if (menuLabelInput.value) {
    menuLabel.ownerData.label.value = menuLabelInput.value;
    menuLabel.ownerData.isActive = true;
  }
  menuLabelInput.value = "";
  menuLabel.classList.remove("show");
});
openSettingBtn.addEventListener("click", () => {
  if (!sideDrawer.isOpen) {
    sideDrawer.style.height = `${canvas.height * 0.9}px`;
    openSettingBtn.style.transform = "rotateZ(180deg)";
  } else {
    sideDrawer.style.height = 0;
    openSettingBtn.style.transform = "rotateZ(0deg)";
  }
  sideDrawer.isOpen = !sideDrawer.isOpen;
});
window.requestAnimationFrame(redraw);
