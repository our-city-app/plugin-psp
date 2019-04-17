import { Config, PluginConfig } from '../../framework/client/core/utils';

export class PspConfig extends PluginConfig {
  public static NAME = 'psp';
  public static VERSION = 'v1.0';
  public static API_URL = `${Config.API_URL}/plugins/${PspConfig.NAME}/${PspConfig.VERSION}`;
}
