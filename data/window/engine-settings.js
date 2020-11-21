/* global CoreEngine, config */

class Engine extends CoreEngine {
  connect() {
    super.connect();
    if (config['runtime-resize']) {
      document.getElementById('canvas-width').disabled = true;
      document.getElementById('canvas-height').disabled = true;
    }
  }
  settings() {
    const parent = document.getElementById('settings');
    if (parent.offsetWidth === 0) {
      // canvas width & height
      {
        const width = document.getElementById('canvas-width');
        const height = document.getElementById('canvas-height');
        width.value = config['canvas-width'];
        width.onchange = () => {
          config['canvas-width'] = Math.max(width.value, 10);
          this.resize();
        };
        height.value = config['canvas-height'];
        height.onchange = () => {
          config['canvas-height'] = Math.max(height.value, 10);
          this.resize();
        };
      }
      // brush width
      {
        const width = document.getElementById('brush-width');
        width.value = config['brush-width'];
        width.onchange = () => {
          config['brush-width'] = Math.max(width.value, 1);
          this.canvas.freeDrawingBrush.width = config['brush-width'];
        };
      }
      // brush width
      {
        const zoom = document.getElementById('canvas-zoom');
        zoom.value = this.canvas.getZoom();
        zoom.onchange = () => {
          this.zoom(Math.max(0.25, Math.min(50, zoom.value)));
        };
      }
      // object width and height
      this.active(([o]) => {
        const width = document.getElementById('object-width');
        const height = document.getElementById('object-height');
        width.value = o.width * o.scaleX;
        height.value = o.height * o.scaleY;
        width.onchange = () => {
          o.scaleX = Math.max(1, width.value) / o.width;
          this.refresh();
        };
        height.onchange = () => {
          o.scaleY = Math.max(height.value, 1) / o.height;
          this.refresh();
        };
      }, () => {
        const width = document.getElementById('object-width');
        const height = document.getElementById('object-height');
        width.value = config['object-width'];
        height.value = config['object-height'];
        width.onchange = () => config['object-width'] = Math.max(1, width.value);
        height.onchange = () => config['object-height'] = Math.max(1, height.value);
      }, true);
      // object stroke
      this.active(os => {
        const width = document.getElementById('object-stroke-width');
        width.value = os[0].strokeWidth;
        width.onchange = () => {
          os.forEach(o => o.set('strokeWidth', Math.max(0, width.value)));
          this.refresh();
        };
      }, () => {
        const width = document.getElementById('object-stroke-width');
        width.value = config['object-stroke-width'];
        width.onchange = () => {
          config['object-stroke-width'] = Math.max(0, width.value);
        };
      });
      // opacity
      this.active(os => {
        const opacity = document.getElementById('object-opacity');
        opacity.value = os[0].opacity;
        opacity.onchange = () => {
          os.forEach(o => o.opacity = Math.max(0.1, opacity.value));
          this.refresh();
        };
      }, () => {
        const opacity = document.getElementById('object-opacity');
        opacity.value = config['object-opacity'];
        opacity.onchange = () => {
          config['object-opacity'] = Math.max(0.1, opacity.value);
        };
      });
      // angle
      this.active(os => {
        const angle = document.getElementById('object-angle');
        angle.value = os[0].angle;
        angle.onchange = () => {
          os.forEach(o => o.rotate(angle.value));
          this.refresh();
        };
      }, () => {
        const angle = document.getElementById('object-angle');
        angle.value = config['object-angle'];
        angle.onchange = () => {
          config['object-angle'] = angle.value;
        };
      });
      // border radius
      this.active(os => {
        const rx = document.getElementById('object-border-radius-x');
        const ry = document.getElementById('object-border-radius-y');
        rx.value = os[0].rx;
        rx.onchange = () => {
          os.forEach(o => o.rx = Math.max(0, rx.value));
          this.refresh();
        };
        ry.value = os[0].ry;
        ry.onchange = () => {
          os.forEach(o => o.ry = Math.max(0, ry.value));
          this.refresh();
        };
      }, () => {
        const rx = document.getElementById('object-border-radius-x');
        const ry = document.getElementById('object-border-radius-y');
        rx.value = config['object-border-radius-x'];
        rx.onchange = () => config['object-border-radius-x'] = rx.value;
        ry.value = config['object-border-radius-y'];
        ry.onchange = () => config['object-border-radius-y'] = ry.value;
      });
      // transparent
      this.active(os => {
        const transparent = document.getElementById('object-transparent');
        transparent.checked = os[0].fill === 'transparent';
        transparent.onchange = () => {
          os.forEach(o => o.set({
            fill: transparent.checked ?
              'transparent' :
              document.querySelector('toolbar-view').get('color-view').front()
          }));
          this.refresh();
        };
      }, () => {
        const transparent = document.getElementById('object-transparent');
        transparent.checked = config['object-transparent'];
        transparent.onchange = () => config['object-transparent'] = transparent.checked;
      });

      parent.classList.add('active');
      parent.querySelector('input:not(:disabled)').focus();
      setTimeout(() => parent.classList.remove('active'), 0);
    }
  }
}

document.getElementById('settings').onkeydown = e => {
  if (e.code === 'Escape') {
    e.target.blur();
  }
};

