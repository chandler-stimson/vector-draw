/* global SettingsEngine, config, initAligningGuidelines, initCenteringGuidelines */

class Engine extends SettingsEngine {
  connect() {
    super.connect();
    if (config['snap-edges']) {
      initAligningGuidelines(this.canvas);
    }
    if (config['snap-center']) {
      initCenteringGuidelines(this.canvas);
    }
  }
}
