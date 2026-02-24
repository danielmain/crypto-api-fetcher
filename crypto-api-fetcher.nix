{ config, pkgs, crypto-api-fetcher-package, ... }:

{
  systemd.services.crypto-api-fetcher = {
    description = "Crypto API Fetcher Service";
    after = [ "network.target" ];
    wantedBy = [ "multi-user.target" ];
    serviceConfig = {
      Type = "simple";
      DynamicUser = true;
      # WorkingDirectory is not strictly needed as the app doesn't write to CWD,
      # and the binary wrapper handles paths.
      ExecStart = "${crypto-api-fetcher-package}/bin/crypto-api-fetcher";
      Restart = "always";
      EnvironmentFile = "/etc/crypto-api-fetcher.env";
    };
  };
}
