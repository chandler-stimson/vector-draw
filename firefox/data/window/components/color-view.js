class ColorView extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        #parent {
          position: relative;
          width: 32px;
          height: 32px;
        }
        #front {
          position: absolute;
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          background-color: var(--front-color, #000);
          border: solid 2px #000;
        }
        #back {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          border: solid 2px #000;
          background-color: var(--background-color, #fff);
        }
      </style>
      <div id="parent">
        <div id="back"></div>
        <div id="front"></div>
      </div>
    `;
  }
  connectedCallback() {
    const front = this.shadowRoot.getElementById('front');
    const back = this.shadowRoot.getElementById('back');
    const onchange = target => {
      const input = document.createElement('input');
      input.type = 'color';
      input.value = this.inspect(target);
      input.oninput = () => {
        target.style['background-color'] = input.value;
        this.dispatchEvent(new Event(target.id + '-changed'));
      };
      input.click();
    };
    front.onclick = onchange.bind(this, front);
    back.onclick = onchange.bind(this, back);
  }
  inspect(target) {
    function rgb2hex(rgb) {
      rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
      function hex(x) {
        return ('0' + parseInt(x).toString(16)).slice(-2);
      }
      return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    return rgb2hex(getComputedStyle(target).backgroundColor);
  }
  front() {
    const front = this.shadowRoot.getElementById('front');
    return this.inspect(front);
  }
  background() {
    const back = this.shadowRoot.getElementById('back');
    return this.inspect(back);
  }
}
window.customElements.define('color-view', ColorView);
