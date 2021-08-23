function snap2edge(canvas) {
  canvas.on('object:moving', ({target}) => {
    const margin = Math.max(1, Math.min(canvas.width, canvas.height) / 50);

    target.setCoords();

    canvas.forEachObject(targ => {
      const activeObject = canvas.getActiveObject();

      if (targ === activeObject) {
        return;
      }
      if (targ.angle % 360 !== 0 || activeObject.angle % 360 !== 0) {
        return;
      }

      if (Math.abs(activeObject.oCoords.tr.x - targ.oCoords.tl.x) < margin) {
        activeObject.left = targ.left + (targ.width - targ.width * targ.scaleX) / 2 - activeObject.width +
          (activeObject.width - activeObject.width * activeObject.scaleX) / 2;
      }
      if (Math.abs(activeObject.oCoords.tl.x - targ.oCoords.tr.x) < margin) {
        activeObject.left = targ.left + targ.width - (targ.width - targ.width * targ.scaleX) / 2 -
          (activeObject.width - activeObject.width * activeObject.scaleX) / 2;
      }
      if (Math.abs(activeObject.oCoords.br.y - targ.oCoords.tr.y) < margin) {
        activeObject.top = targ.top + (targ.height - targ.height * targ.scaleY) / 2 - activeObject.height +
          (activeObject.height - activeObject.height * activeObject.scaleY) / 2;
      }
      if (Math.abs(targ.oCoords.br.y - activeObject.oCoords.tr.y) < margin) {
        activeObject.top = targ.top + targ.height - (targ.height - targ.height * targ.scaleY) / 2 -
          (activeObject.height - activeObject.height * activeObject.scaleY) / 2;
      }
    });
  });
}
