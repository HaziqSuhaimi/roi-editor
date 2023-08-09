const {
  renderDrawCanvas,
  renderImgCanvas,
  renderMenu,
  renderLabelInput,
  renderToolbar,
} = require("./components");
require("./bootstrap.min.css");

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
