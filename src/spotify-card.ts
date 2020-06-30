import {
  LitElement,
  html,
  customElement,
  property,
  internalProperty,
  CSSResult,
  TemplateResult,
  css,
} from 'lit-element';

import { HomeAssistant, LovelaceCardEditor, getLovelace, LovelaceCard } from 'custom-card-helpers';
import { servicesColl } from 'home-assistant-js-websocket';

import './editor';
import { PLAYLIST_TYPES, DISPLAY_STYLES } from './editor';
import './spotcast-connector';

import { SpotifyCardConfig } from './types';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';
import { SpotcastConnector } from './spotcast-connector';

//Display card verion in console
/* eslint no-console: 0 */
console.info(
  `%c  SPOTIFY-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

//Configures the preview in the Lovelace card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'spotify-card',
  name: 'Spotify Card',
  //TODO: check description
  description: 'A custom card for displaying Spotify-Playlist and starting playback',
  preview: true,
});

@customElement('spotify-card')
export class SpotifyCard extends LitElement {
  //Calls the editor
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('spotify-card-editor') as LovelaceCardEditor;
  }

  //Returns default config for Lovelace picker
  public static getStubConfig(): Record<string, unknown> {
    return { playlist_type: '' };
  }

  // TODO Add any properities that should cause re-render
  @property({ type: Object })
  public hass!: HomeAssistant;
  @property({ type: Object })
  public config!: SpotifyCardConfig;
  @internalProperty()
  private spotcast_connector!: SpotcastConnector;

  //Private variables
  private spotcast_installed = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.spotcast_connector = new SpotcastConnector(this);
  }

  public setConfig(_config: SpotifyCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    let var_error = '';
    if (_config.limit && !(typeof _config.limit === 'number')) {
      var_error = 'limit';
    }
    if (_config.playlist_type && !PLAYLIST_TYPES.includes(_config.playlist_type)) {
      var_error = 'playlist_type';
    }
    if (_config.height && !(typeof _config.height === 'number')) {
      var_error = 'height';
    }
    if (_config.display_style && !DISPLAY_STYLES.includes(_config.display_style)) {
      var_error = 'display_style';
    }
    if (_config.darkmode && !(typeof _config.darkmode === 'boolean')) {
      var_error = 'darkmode';
    }
    //Error test mode
    if (_config.show_error || var_error != '') {
      throw new Error(localize('common.invalid_configuration') + var_error);
    }

    //Convenience mode
    if (_config.test_gui) {
      getLovelace().setEditMode(true);
    }

    let spotify_icon = '../local/community/spotify-card/img/Spotify_Logo_RGB_Black.png';
    if (_config.dark_mode) {
      spotify_icon = '../local/community/spotify-card/img/Spotify_Logo_RGB_White.png';
    }
    this.config = {
      spotify_icon,
      ..._config,
    };
  }

  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing

    let warning = html``;
    if (this.config.show_warning) {
      warning = this.showWarning(localize('common.show_warning'));
    }
    //Check for installed spotcast
    if (servicesColl(this.hass.connection).state.spotcast === undefined) {
      warning = this.showWarning(localize('common.show_missing_spotcast'));
    } else {
      this.spotcast_installed = true;
    }

    //Display loading screen if no content available yet
    let content = html`<div>loading</div>`;
    if (!this.spotcast_connector.is_loading() && this.spotcast_installed) {
      this.spotcast_connector.fetchPlaylists();
    } else {
      //TODO add renderstyle
      content = this.generatePlaylistHTML();
    }

    return html`
      <ha-card tabindex="0" style="${this.config.height ? `height: ${this.config.height}px` : ``}"
        >${warning}
        <div id="header">
          <div id="icon"><img src=${this.config.spotify_icon} /></div>
          ${this.config.name ? html`<div id="header_name">${this.config.name}</div>` : ''}
          <div></div>
        </div>
        <div id="content">
          ${content}
        </div>
        <div id="footer"></div>
      </ha-card>
    `;
  }

  public generatePlaylistHTML(): TemplateResult {
    if (this.spotcast_connector.is_loaded()) {
      const list = this.spotcast_connector.playlists.map((item) => {
        return html`<div class="list-item">
          <img src="${item.images[item.images.length - 1].url}" />
          <svg width="20" height="20">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg width="20" height="20">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
            />
          </svg>
          ${item.name}
        </div>`;
      });

      return html`<div>${list}</div>`;
    }
    return html``;
  }

  private showWarning(warning: string): TemplateResult {
    return html`<hui-warning>${warning}</hui-warning>`;
  }

  private showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card') as LovelaceCard;
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html` ${errorCard} `;
  }

  static get styles(): CSSResult[] {
    return [
      css`
        ha-card {
          --header-height: 4em;
          --footer-height: 3em;
        }

        #header {
          display: flex;
          height: var(--header-height);
        }
        #header > * {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #content {
          height: calc(100% - var(--header-height) - var(--footer-height));
          overflow: auto;
        }

        #icon {
          justify-content: left;
          padding-left: 1em;
        }

        #icon img {
          width: 100px;
        }

        #header_name {
          font-size: x-large;
        }

        #footer {
          height: var(--footer-height);
          background-color: grey;
        }
      `,
      SpotifyCard.listStyles,
    ];
  }

  static listStyles = css`
    .list-item {
      height: 60px;
      border-bottom: solid black 1px;
    }

    .list-item > img {
      height: 60px;
    }
  `;

  static litIconSet = html` <lit-iconset iconset="iconset">
    <svg>
      <defs>
        <g id="play">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M8 5v14l11-7z" />
        </g>
      </defs>
    </svg>
  </lit-iconset>`;
}
