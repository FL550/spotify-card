import { LovelaceCardConfig } from 'custom-card-helpers';

export interface SpotifyCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  playlist_type: string;
  country_code?: string;
  height?: string;
  limit?: number;
  hide_warning?: boolean;
  //TODO add
  //locale
  // random_song
  //TODO below not implemented in code
  display_style?: string;
  darkmode?: boolean;

  //TODO: used for development
  show_warning?: boolean;
  show_error?: boolean;
}
