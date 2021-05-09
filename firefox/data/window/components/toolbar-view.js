/* global engine */
class ToolbarView extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        #parent {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        #parent > * {
          cursor: pointer;
          padding: 10px;
        }
        #parent > [data-id]:hover {
          background-color: var(--hover-bg, #f1f1f1);
        }
        #history {
          display: flex;
        }
        svg * {
          pointer-events: none;
        }
        .disabled {
          cursor: default;
          opacity: 0.2;
          pointer-events: none;
        }
        .spacer {
          flex: 1;
        }
      </style>
      <div id="parent">
        <svg viewBox="0 0 512 512" data-id="close">
          <title>Exit</title>
          <path d="M437.5,386.6L306.9,256l130.6-130.6c14.1-14.1,14.1-36.8,0-50.9c-14.1-14.1-36.8-14.1-50.9,0L256,205.1L125.4,74.5  c-14.1-14.1-36.8-14.1-50.9,0c-14.1,14.1-14.1,36.8,0,50.9L205.1,256L74.5,386.6c-14.1,14.1-14.1,36.8,0,50.9  c14.1,14.1,36.8,14.1,50.9,0L256,306.9l130.6,130.6c14.1,14.1,36.8,14.1,50.9,0C451.5,423.4,451.5,400.6,437.5,386.6z"/>
        </svg>
        <svg viewBox="0 0 128 128" data-id="pen">
          <title>Meta + Shift + P</title>
          <path d="M91.4,63.5L64.5,36.6L1,100.1V127h26.9L91.4,63.5z M9,119v-15.6l55.5-55.5l15.6,15.6L24.6,119H9z"/>
          <path d="M71.6,29.6l26.9,26.9L116.8,38L90,11.2L71.6,29.6z M98.4,45.1L82.9,29.6l7.1-7.1L105.5,38L98.4,45.1z"/>
        </svg>
        <shape-view name="shape">
          <svg viewBox="0 0 32 32" data-id="circle">
            <title>Meta + Shift + C</title>
            <circle cx="16" cy="16" r="14" fill="transparent" stroke="#000" stroke-width="2"/>
          </svg>
          <svg viewBox="0 0 32 32" data-id="rect" slot="list">
            <title>Meta + Shift + R</title>
            <rect x="3" y="3" width="26" height="26" fill="transparent" stroke="#000" stroke-width="2"/>
          </svg>
          <svg viewBox="0 0 32 32" data-id="line" slot="list">
            <title>Meta + Shift + L</title>
            <line x1="2" y1="2" x2="30" y2="30" stroke="#000" stroke-width="2"/>
          </svg>
          <svg viewBox="0 0 32 32" data-id="polygon" slot="list">
            <title>Meta + Shift + O</title>
            <polygon points="3,29 29,29 16,3" fill="transparent" stroke="#000" stroke-width="2"/>
          </svg>
        </shape-view>
        <svg viewBox="0 0 1792 1792" data-id="hand">
          <title>Escape</title>
          <path d="M880 128q-46 0-79 33t-33 79v656h-32v-528q0-46-33-79t-79-33-79 33-33 79v784l-154-205q-38-51-102-51-53 0-90.5 37.5t-37.5 90.5q0 43 26 77l384 512q38 51 102 51h688q34 0 61-22t34-56l76-405q5-32 5-59v-498q0-46-33-79t-79-33-79 33-33 79v272h-32v-528q0-46-33-79t-79-33-79 33-33 79v528h-32v-656q0-46-33-79t-79-33zm0-128q68 0 125.5 35.5t88.5 96.5q19-4 42-4 99 0 169.5 70.5t70.5 169.5v17q105-6 180.5 64t75.5 175v498q0 40-8 83l-76 404q-14 79-76.5 131t-143.5 52h-688q-60 0-114.5-27.5t-90.5-74.5l-384-512q-51-68-51-154 0-106 75-181t181-75q78 0 128 34v-434q0-99 70.5-169.5t169.5-70.5q23 0 42 4 31-61 88.5-96.5t125.5-35.5z"/>
        </svg>
        <svg viewBox="0 0 20 20" data-id="text">
          <title>Meta + Shift + T</title>
          <path d="M16 9v8h-2V9h-4V7h10v2h-4zM8 5v12H6V5H0V3h15v2H8z"/>
        </svg>
        <svg viewBox="0 0 32 32" data-id="trash" class="disabled">
          <title>Delete or Backspace</title>
          <path d="M25,10H7v17c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V10z" fill="none" id="XMLID_194_" stroke="#000000" stroke-width="2"/>
          <path d="  M20,7h-8V5c0-1.105,0.895-2,2-2h4c1.105,0,2,0.895,2,2V7z" fill="none" id="XMLID_193_" stroke="#000000" stroke-width="2"/>
          <path d="  M28,10H4V8c0-0.552,0.448-1,1-1h22c0.552,0,1,0.448,1,1V10z" fill="none" id="XMLID_192_" stroke="#000000" stroke-width="2"/>
          <line fill="none" id="XMLID_191_" stroke="#000000" stroke-width="2" x1="13" x2="19" y1="16" y2="22"/>
          <line fill="none" id="XMLID_190_" stroke="#000000" stroke-width="2" x1="13" x2="19" y1="22" y2="16"/>
        </svg>

        <div class="spacer"></div>
        <shape-view name="stack" class="disabled">
          <svg viewBox="0 0 32 32" data-id="bringForward" width="32">
            <title>Meta + Shift + ArrowUp</title>
            <rect x="0" y="0" width="18" height="18" fill="#000" stroke="#000" stroke-with="2"/>
            <rect x="8" y="8" width="22" height="22" fill="#fff" stroke="#000" stroke-with="2"/>
          </svg>
          <svg viewBox="0 0 32 32" data-id="bringToFront" width="32" slot="list">
            <rect x="16" y="16" width="16" height="16" fill="#000" stroke="#000" stroke-with="2"/>
            <rect x="0" y="0" width="16" height="16" fill="#000" stroke="#000" stroke-with="2"/>
            <rect x="5" y="5" width="22" height="22" fill="#fff" stroke="#000" stroke-with="2"/>
          </svg>
          <svg viewBox="0 0 32 32" data-id="sendBackwards" width="32" slot="list">
            <title>Meta + Shift + ArrowDown</title>
            <rect x="8" y="8" width="22" height="22" fill="#fff" stroke="#000" stroke-with="2"/>
            <rect x="0" y="0" width="18" height="18" fill="#000" stroke="#000" stroke-with="2"/>
          </svg>
          <svg viewBox="0 0 32 32" data-id="sendToBack" width="32" slot="list">
            <rect x="5" y="5" width="22" height="22" fill="#fff" stroke="#000" stroke-with="2"/>
            <rect x="16" y="16" width="16" height="16" fill="#000" stroke="#000" stroke-with="2"/>
            <rect x="0" y="0" width="16" height="16" fill="#000" stroke="#000" stroke-with="2"/>
          </svg>
        </shape-view>

        <svg viewBox="0 0 48 48" class="disabled" data-id="undo">
          <title>Meta + Z</title>
          <path d="M0 0h48v48H0z" fill="none"/>
          <path d="M25 16c-5.29 0-10.11 1.97-13.8 5.2L4 14v18h18l-7.23-7.23C17.54 22.44 21.09 21 25 21c7.09 0 13.09 4.61 15.19 11l4.73-1.56C42.17 22.06 34.3 16 25 16z"/>
        </svg>
        <svg viewBox="0 0 48 48" class="disabled" data-id="redo">
          <title>Meta + Y</title>
          <path d="M0 0h48v48H0z" fill="none"/>
          <path d="M36.79 21.2C33.11 17.97 28.29 16 23 16c-9.3 0-17.17 6.06-19.92 14.44L7.81 32c2.1-6.39 8.1-11 15.19-11 3.91 0 7.46 1.44 10.23 3.77L26 32h18V14l-7.21 7.2z"/>
        </svg>
        <color-view></color-view>
        <svg viewBox="0 0 48 48" data-id="settings">
          <title>Meta + Shift + S</title>
          <path d="M0 0h48v48H0z" fill="none"/>
          <path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
        </svg>
        <svg viewBox="0 0 512 512" data-id="download" data-shift-id="export">
          <title>Meta + Shift + D to Download as PNG&#013;Meta + S to Save as SVG</title>
          <path d="M422,119h-72V96.499C350,81.309,337.69,69,322.5,69h-135C172.31,69,160,81.309,160,96.499V119H88    c-20.99,0-38,17.008-38,37.999v222C50,399.988,67.01,417,88,417h334c20.99,0,38-17.012,38-38.002v-222    C460,136.008,442.99,119,422,119z" fill="#ccc"/>
          <path d="M400,158.999c11.05,0,20,8.95,20,20s-8.95,20-20,20s-20-8.95-20-20S388.95,158.999,400,158.999z"/>
          <path d="M255,178.999c49.71,0,90,40.29,90,90c0,49.711-40.29,90-90,90s-90-40.289-90-90     C165,219.289,205.29,178.999,255,178.999z"/>
        </svg>
      </div>
    `;
  }
  connectedCallback() {
    const parent = this.shadowRoot.getElementById('parent');
    parent.onclick = ({target, shiftKey}) => {
      const id = target.dataset.id;
      const shiftId = target.dataset.shiftId;
      if (id) {
        this.dispatchEvent(new CustomEvent('object', {
          detail: {
            id: shiftKey ? (shiftId || id) : id
          }
        }));
      }
    };

    const color = this.get('color-view');
    color.addEventListener('front-changed', () => this.dispatchEvent(new CustomEvent('color-changed', {
      detail: {
        type: 'front-color',
        value: color.front()
      }
    })));
    color.addEventListener('back-changed', () => this.dispatchEvent(new CustomEvent('color-changed', {
      detail: {
        type: 'back-color',
        value: color.background()
      }
    })));
  }
  get(name) {
    const parent = this.shadowRoot.getElementById('parent');
    return parent.querySelector(`[data-id="${name}"]`) || parent.querySelector(`${name}`);
  }
  enable(name) {
    this.get(name).classList.remove('disabled');
  }
  disable(name) {
    this.get(name).classList.add('disabled');
  }
}
window.customElements.define('toolbar-view', ToolbarView);
