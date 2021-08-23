/* global engine, config, fabric */

// clipboard
{
  const {canvas} = engine;

  let clipboard;
  const copy = () => {
    canvas.getActiveObject().clone(function(cloned) {
      clipboard = cloned;
    });
  };

  const paste = () => {
    if (clipboard) {
      clipboard.clone(clonedObj => {
        canvas.discardActiveObject();
        clonedObj.set({
          left: clonedObj.left + 10,
          top: clonedObj.top + 10,
          evented: true
        });
        // active selection needs a reference to the canvas.
        if (clonedObj.type === 'activeSelection') {
          clonedObj.canvas = canvas;
          clonedObj.forEachObject(function(obj) {
            canvas.add(obj);
          });
          // this should solve the unselectability
          clonedObj.setCoords();
        }
        else {
          canvas.add(clonedObj);
        }
        clipboard.top += 10;
        clipboard.left += 10;
        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
      });
    }
  };

  window.addEventListener('keydown', e => {
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.shiftKey === false && e.code === 'KeyC') {
      copy();
      e.stopPropagation();
    }
    else if (meta && e.shiftKey === false && e.code === 'KeyV') {
      paste();
      e.stopPropagation();
    }
  });
}
window.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('#settings')) {
    return;
  }
  const meta = e.ctrlKey || e.metaKey;

  const click = (name, shiftKey) => {
    const view = document.querySelector('toolbar-view');
    view.get(name).dispatchEvent(new Event('click', {
      bubbles: true,
      shiftKey
    }));
    e.preventDefault();
  };

  if (e.code === 'Delete' || e.code === 'Backspace') {
    engine.active(os => {
      if (os.some(o => o.isEditing)) {
        return;
      }
      click('trash');
    });
  }
  else if (meta && e.shiftKey && e.code === 'KeyP') {
    click('pen');
  }
  else if (e.code === 'Escape') {
    click('hand');
  }
  else if (meta && e.shiftKey && e.code === 'KeyC') {
    click('circle');
  }
  else if (meta && e.shiftKey && e.code === 'KeyR') {
    click('rect');
  }
  else if (meta && e.shiftKey && e.code === 'KeyO') {
    click('polygon');
  }
  else if (meta && e.shiftKey && e.code === 'KeyL') {
    click('line');
  }
  else if (meta && e.shiftKey && e.code === 'KeyT') {
    click('text');
  }
  else if (meta && e.shiftKey && e.code === 'ArrowUp') {
    click('bringForward');
  }
  else if (meta && e.shiftKey && e.code === 'ArrowDown') {
    click('sendBackwards');
  }
  else if (e.code === 'BracketLeft') {
    engine.active(([o]) => {
      o.scaleX -= config['scale-step'];
      o.scaleY -= config['scale-step'];
      engine.refresh();
    }, undefined, true);
    e.preventDefault();
  }
  else if (e.code === 'BracketRight') {
    engine.active(([o]) => {
      o.scaleX += config['scale-step'];
      o.scaleY += config['scale-step'];
      engine.refresh();
    }, undefined, true);
    e.preventDefault();
  }
  else if (e.code === 'Comma') {
    engine.active(([o]) => {
      o.rotate(o.angle - config['rotate-step']);
      engine.refresh();
    }, undefined, true);
    e.preventDefault();
  }
  else if (e.code === 'Period') {
    engine.active(([o]) => {
      o.rotate(o.angle + config['rotate-step']);
      engine.refresh();
    }, undefined, true);
    e.preventDefault();
  }
  else if (e.code === 'ArrowDown') {
    engine.active(([o]) => {
      o.top += e.shiftKey ? config['move-step'] : 1;
      engine.refresh();
    }, undefined, true);
    e.preventDefault();
  }
  else if (e.code === 'ArrowUp') {
    engine.active(([o]) => {
      o.top -= e.shiftKey ? config['move-step'] : 1;
      engine.refresh();
    }, undefined, true);
    e.preventDefault();
  }
  else if (e.code === 'ArrowLeft') {
    engine.active(([o]) => {
      o.left -= e.shiftKey ? config['move-step'] : 1;
      engine.refresh();
    }, undefined, true);
    e.preventDefault();
  }
  else if (e.code === 'ArrowRight') {
    engine.active(([o]) => {
      o.left += e.shiftKey ? config['move-step'] : 1;
      engine.refresh();
    }, undefined, true);
    e.preventDefault();
  }
  else if (meta && e.code === 'KeyZ') {
    click('undo');
  }
  else if (meta && e.code === 'KeyY') {
    click('redo');
  }
  else if (meta && e.code === 'KeyA' && e.shiftKey === false) {
    const {canvas} = engine;
    canvas.discardActiveObject();
    const sel = new fabric.ActiveSelection(canvas.getObjects(), {
      canvas
    });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
  }
  else if (meta && e.code === 'KeyA' && e.shiftKey) {
    this.canvas.discardActiveObject();
  }
  else if (meta && e.shiftKey && e.code === 'KeyS') {
    click('settings');
  }
  else if ((meta && e.shiftKey && e.code === 'KeyD')) {
    click('download');
  }
  else if (meta + e.code === 'KeyS') {
    click('download', true);
  }
  else if (meta && e.code === 'Equal') {
    const v = Math.min(engine.canvas.getZoom() + 0.25, 50);
    engine.zoom(v);
    e.preventDefault();
  }
  else if (meta && e.code === 'Minus') {
    const v = Math.max(engine.canvas.getZoom() - 0.25, 0.25);
    engine.zoom(v);
    e.preventDefault();
  }
  else if (meta && e.shiftKey && e.code === 'KeyH') {
    const toolbar = document.querySelector('toolbar-view');
    const v = toolbar.style.visibility;
    toolbar.style.visibility = v === 'hidden' ? 'visible' : 'hidden';
    e.preventDefault();
  }
});
