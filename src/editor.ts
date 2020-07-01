import {
  LitElement,
  html,
  customElement,
  property,
  internalProperty,
  TemplateResult,
  CSSResult,
  css,
} from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { SpotifyCardConfig } from './types';
import { localize } from './localize/localize';

const options = {
  general: {
    icon: 'tune',
    name: localize('settings.general'),
    secondary: localize('settings.general_description'),
    show: true,
  },
  appearance: {
    icon: 'palette',
    name: localize('settings.appearance'),
    secondary: localize('settings.appearance_description'),
    show: false,
  },
};

export const PLAYLIST_TYPES = ['Default', 'featured', 'discover-weekly'];
export const DISPLAY_STYLES = ['List', 'Grid'];

@customElement('spotify-card-editor')
export class SpotifyCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ type: Object }) public hass?: HomeAssistant;
  @internalProperty() private _config?: SpotifyCardConfig;
  @internalProperty() private _toggle?: boolean;

  public setConfig(config: SpotifyCardConfig): void {
    this._config = config;
  }

  get _name(): string {
    if (this._config) {
      return this._config.name || '';
    }
    return '';
  }

  get _country_code(): string {
    if (this._config) {
      return this._config.country_code || '';
    }
    return '';
  }

  get _limit(): number {
    if (this._config) {
      return this._config.limit || 10;
    }
    return 10;
  }

  get _playlist_type(): string {
    if (this._config) {
      return this._config.playlist_type || 'Default';
    }
    return '';
  }

  get _height(): string | number {
    if (this._config) {
      return this._config.height || '';
    }
    return '';
  }

  get _display_style(): string {
    if (this._config) {
      return this._config.display_style || 'List';
    }
    return 'List';
  }

  get _darkmode(): boolean {
    if (this._config) {
      return this._config.darkmode || false;
    }
    return false;
  }

  get _hide_warning(): boolean {
    if (this._config) {
      return this._config.hide_warning || false;
    }
    return false;
  }

  get _show_warning(): boolean {
    if (this._config) {
      return this._config.show_warning || false;
    }
    return false;
  }

  get _show_error(): boolean {
    if (this._config) {
      return this._config.show_error || false;
    }
    return false;
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="option" @click=${this._toggleOption} .option=${'general'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.general.icon}`}></ha-icon>
            <div class="title">${options.general.name}</div>
          </div>
          <div class="secondary">${options.general.secondary}</div>
        </div>
        ${options.general.show
          ? html`
              <div class="values">
                <div>
                  <paper-dropdown-menu
                    label=${localize('settings.playlist_type')}
                    @value-changed=${this._valueChanged}
                    .configValue=${'playlist_type'}
                  >
                    <paper-listbox slot="dropdown-content" .selected=${PLAYLIST_TYPES.indexOf(this._playlist_type)}>
                      ${PLAYLIST_TYPES.map((item) => {
                        return html` <paper-item>${item}</paper-item> `;
                      })}
                    </paper-listbox>
                  </paper-dropdown-menu>
                </div>
                <div>
                  <div>${localize('settings.limit')}</div>
                  <paper-slider
                    .value=${this._limit}
                    .configValue=${'limit'}
                    @value-changed=${this._valueChanged}
                    max="50"
                    editable
                    pin
                  ></paper-slider>
                </div>
                <div>
                  <paper-input
                    label=${localize('settings.height')}
                    .value=${this._height}
                    .configValue=${'height'}
                    @value-changed=${this._valueChanged}
                  ></paper-input>
                </div>
                <div>
                  <paper-input
                    label=${localize('settings.country_code')}
                    .value=${this._country_code}
                    .configValue=${'country_code'}
                    @value-changed=${this._valueChanged}
                  ></paper-input>
                </div>
              </div>
            `
          : ''}
        <div class="option" @click=${this._toggleOption} .option=${'appearance'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.appearance.icon}`}></ha-icon>
            <div class="title">${options.appearance.name}</div>
          </div>
          <div class="secondary">${options.appearance.secondary}</div>
        </div>
        ${options.appearance.show
          ? html`
              <div class="values">
                <div>
                  <ha-switch
                    aria-label=${`Hide Warnings ${this._darkmode ? 'off' : 'on'}`}
                    .checked=${this._hide_warning}
                    .configValue=${'hide_warning'}
                    @change=${this._valueChanged}
                    >${localize('settings.hide_warning')}</ha-switch
                  >
                </div>
                <div>
                  <paper-input
                    label=${localize('settings.title')}
                    .value=${this._name}
                    .configValue=${'name'}
                    @value-changed=${this._valueChanged}
                  ></paper-input>
                </div>
                <div>
                  <paper-dropdown-menu
                    label=${localize('settings.display_style')}
                    @value-changed=${this._valueChanged}
                    .configValue=${'display_style'}
                  >
                    <paper-listbox slot="dropdown-content" .selected=${DISPLAY_STYLES.indexOf(this._display_style)}>
                      ${DISPLAY_STYLES.map((item) => {
                        return html` <paper-item>${item}</paper-item> `;
                      })}
                    </paper-listbox>
                  </paper-dropdown-menu>
                </div>
                <div>
                  <!-- TODO Darkmode neccessary? -->
                  <ha-switch
                    aria-label=${`Toggle Darkmode ${this._darkmode ? 'off' : 'on'}`}
                    .checked=${this._darkmode}
                    .configValue=${'darkmode'}
                    @change=${this._valueChanged}
                    >Toggle Darkmode</ha-switch
                  >
                </div>
                <ha-switch
                  aria-label=${`Toggle warning ${this._show_error ? 'off' : 'on'}`}
                  .checked=${this._show_warning}
                  .configValue=${'show_warning'}
                  @change=${this._valueChanged}
                  >Show Warning?</ha-switch
                >
                <ha-switch
                  aria-label=${`Toggle error ${this._show_error ? 'off' : 'on'}`}
                  .checked=${this._show_error}
                  .configValue=${'show_error'}
                  @change=${this._valueChanged}
                  >Show Error?</ha-switch
                >
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _toggleOption(ev): void {
    this._toggleThing(ev, options);
  }

  private _toggleThing(ev, optionList): void {
    const show = !optionList[ev.target.option].show;
    for (const [key] of Object.entries(optionList)) {
      optionList[key].show = false;
    }
    optionList[ev.target.option].show = show;
    this._toggle = !this._toggle;
  }

  private _valueChanged(ev): void {
    //ev.target.offsetParent checks if editor visible or freetext input is used
    if (!this._config || !this.hass || ev.target.offsetParent === null) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      //Delete item if false or empty
      if (target.checked === false || target.value === '') {
        const clone = Object.assign({}, this._config);
        delete clone[target.configValue];
        this._config = clone;
      } else {
        if (target.configValue == 'height') {
          target.value = Number(target.value);
        }
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
    this.requestUpdate(target.configValue);
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        background: var(--secondary-background-color);
      }

      .values > * {
        padding-top: 16px;
        padding-left: 16px;
        border-bottom: solid var(--divider-color) 2px;
      }

      .values > *:last-child {
        border-bottom: 0;
      }

      ha-switch {
        padding-bottom: 8px;
      }

      paper-input {
        margin-top: -1em;
      }
    `;
  }
}
