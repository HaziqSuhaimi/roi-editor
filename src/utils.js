const getCursorPosition = (mousePos, canvas, event, state) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  mousePos = { ...mousePos, x, y, state };
  return mousePos
};

module.exports = { getCursorPosition };
