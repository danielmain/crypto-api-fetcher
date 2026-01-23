{ config, lib, pkgs, ... }:

let
  cfg = config.services.crypto-api-fetcher;
in
{
  options.services.crypto-api-fetcher = {
    enable = lib.mkEnableOption "crypto-api-fetcher service";

    package = lib.mkOption {
      type = lib.types.package;
      description = "The crypto-api-fetcher package to use. Default uses 'pkgs.crypto-api-fetcher' (requires overlay).";
      default = pkgs.crypto-api-fetcher;
    };

    environmentFile = lib.mkOption {
      type = lib.types.nullOr lib.types.path;
      default = null;
      description = ''
        Path to the .env file containing configuration secrets (like FREECRYPTO_API_KEY).
        Should contain:
        FREECRYPTO_API_KEY=...
        FREECRYPTO_BASE_URL=...
        PRICE_CACHE_TTL_MINUTES=...
        CRYPTO_LIST_CACHE_TTL_MINUTES=...
      '';
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3000;
      description = "The port the service should listen on.";
    };
  };

  config = lib.mkIf cfg.enable {
    systemd.services.crypto-api-fetcher = {
      description = "Crypto API Fetcher Service";
      after = [ "network.target" ];
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        Type = "simple";
        DynamicUser = true;
        ExecStart = "${cfg.package}/bin/crypto-api-fetcher";
        Restart = "always";
        Environment = [ "PORT=${toString cfg.port}" ];
        EnvironmentFile = lib.mkIf (cfg.environmentFile != null) cfg.environmentFile;
      };
    };
  };
}
