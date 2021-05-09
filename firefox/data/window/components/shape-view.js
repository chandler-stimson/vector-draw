class ShapeView extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({
      mode: 'open'
    });
    shadow.innerHTML = `
      <style>
        ::slotted(svg) {
          width: 32px;
          height: 32px;
        }
        ::slotted(svg *) {
          pointer-events: none;
        }
        #selected {
          position: relative;
          width: 32px;
          height: 32px;
          outline: none;
        }
        #more {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 32px;
          width: 10px;
          height: 10px;
        }
        #list {
          position: absolute;
          left: 42px;
          top: -10px;
          padding-left: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #list ::slotted(svg) {
          padding: 10px;
        }
        #list ::slotted(svg:hover) {
          background-color: var(--hover-bg, #fff);
        }
        #more:not(.open) + #list {
          display: none;
        }
      </style>
      <div id="selected" tabindex="0">
        <slot></slot>
        <svg id="more" viewBox="0 0 10 10">
          <polygon points="0,0 10,0, 10,10" fill="red"/>
        </svg>
        <div id="list">
          <slot name="list"></slot>
        </div>
      </div>
    `;
  }
  connectedCallback() {
    const more = this.shadowRoot.getElementById('more');
    more.onclick = e => {
      more.classList.toggle('open');
      e.stopPropagation();
    };

    const [sm, sl] = [...this.shadowRoot.querySelectorAll('slot')];
    sl.addEventListener('slotchange', () => {
      for (const node of sl.assignedElements()) {
        node.onclick = () => {
          sm.assignedElements().shift().slot = 'list';
          node.slot = '';
          more.classList.remove('open');
        };
      }
    });
  }
}
window.customElements.define('shape-view', ShapeView);
