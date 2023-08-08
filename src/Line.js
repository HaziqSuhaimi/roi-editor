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
