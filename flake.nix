{
  description = "crypto-api-fetcher";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    let
      systemOutputs = flake-utils.lib.eachDefaultSystem (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          packages.default = pkgs.buildNpmPackage {
            pname = "crypto-api-fetcher";
            version = "0.1.0";

            src = ./.;

            npmDepsHash = "sha256-ytD+xF0gMxs+ST1b+SXih2F2YHXdo/C7kv43GBDVwk0=";

            nativeBuildInputs = [ pkgs.typescript ];

            buildPhase = ''
              npm run build
            '';

            installPhase = ''
              mkdir -p $out/bin $out/lib
              cp -r dist $out/lib/dist
              cp -r node_modules $out/lib/node_modules
              
              # Create a wrapper script
              echo "#!${pkgs.runtimeShell}" > $out/bin/crypto-api-fetcher
              echo "${pkgs.nodejs_24}/bin/node $out/lib/dist/index.js" >> $out/bin/crypto-api-fetcher
              chmod +x $out/bin/crypto-api-fetcher
            '';
          };

          devShells.default = pkgs.mkShell {
            packages = [ pkgs.nodejs_24 ];
          };
        }
      );
    in
    systemOutputs // {
      nixosModules.default = import ./nix/module.nix;

      overlays.default = final: prev: {
        crypto-api-fetcher = self.packages.${prev.system}.default;
      };
    };
}
